import { BrowserWindow } from "electron";
import { sleep } from "../../utils/sleep";
import { window } from "../../main";

interface IDeviceCodeResponse {
    user_code: string;
    device_code: string;
    verification_uri: string;
    interval: number;
    expires_in: number;
}

interface IOAuthResponse {
    token_type: string;
    expires_in: number;
    scope: string;
    access_token: string;
    refresh_token: string;
    user_ud: string;
}
/**
 *
 * @returns The refresh token after authenticating, or undefined if unable to authenticate.
 */
export async function authenticate(): Promise<string | undefined> {
    const response = await fetch("https://login.live.com/oauth20_connect.srf", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "client_id=0000000040159362&scope=service::user.auth.xboxlive.com::MBI_SSL&response_type=device_code",
    });

    if (!response.ok) {
        return undefined;
    }

    const json = (await response.json()) as IDeviceCodeResponse;
    const { verification_uri, device_code, expires_in, user_code } = json;

    window?.webContents.send(
        "showModalMessage",
        `A new window will appear shortly. Please enter the following code into the box that pops up and follow the prompts to sign into Minecraft.\n${user_code}`,
        "Sign in Required",
    );

    console.log(user_code);

    const height = 600;
    const width = 500;
    const authWindow = new BrowserWindow({ width: width, height: height, maxWidth: width, maxHeight: height, minWidth: width, minHeight: height });
    authWindow.removeMenu();
    authWindow.loadURL(verification_uri);

    let secondsPassed = 0;
    const interval = setInterval(() => {
        secondsPassed++;
    }, 1000);

    let refreshToken: string | undefined = undefined;

    while (secondsPassed < expires_in * 1000) {
        const oauthResponse = await fetch("https://login.live.com/oauth20_token.srf", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `device_code=${device_code}&client_id=0000000040159362&grant_type=device_code`,
        });

        if (oauthResponse.ok) {
            const oauthJson = (await oauthResponse.json()) as IOAuthResponse;
            refreshToken = oauthJson.refresh_token;
            break;
        }

        await sleep(1500);
    }

    clearInterval(interval);
    authWindow.destroy();
    window?.webContents.send("hideModalMessage");

    return refreshToken;
}
