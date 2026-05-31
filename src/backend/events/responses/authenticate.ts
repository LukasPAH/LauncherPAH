import { BrowserWindow } from "electron";
import { sleep } from "../../utils/sleep";
import { window } from "../../main";
import * as fsAsync from "fs/promises";
import * as path from "path";
import os from "node:os";
import * as settings from "../../settings";

interface ILoginJSON {
    user_code: string;
    verification_uri: string;
}

export async function watchForLoginJSON() {
    if (os.platform() !== "linux") {
        return;
    }

    const folder = settings.installationsLocation;

    const watcher = fsAsync.watch(folder, { recursive: false });
    const loginFile = path.join(folder, "login.json");
    for await (const event of watcher) {
        if (event.eventType === "change" && event.filename === "login.json") {
            try {
                const loginString = (await fsAsync.readFile(loginFile)).toString();
                const loginJSON = parseLoginJSON(loginString);
                if (loginJSON) {
                    await authenticate(loginJSON.verification_uri, loginJSON.user_code);
                }
                await fsAsync.rm(loginFile);
            } catch {
                continue;
            }
        }
    }
}

function parseLoginJSON(dataString: string): ILoginJSON | undefined {
    const json = JSON.parse(dataString);

    const returnJSON: ILoginJSON = {
        user_code: "",
        verification_uri: "",
    };

    const user_code = json.user_code;
    const verification_uri = json.verification_uri;

    if (typeof user_code === "string") {
        returnJSON.user_code = user_code;
    } else {
        return undefined;
    }

    if (typeof verification_uri === "string") {
        returnJSON.verification_uri = verification_uri;
    } else {
        return undefined;
    }

    return returnJSON;
}

/**
 *
 * @returns The refresh token after authenticating, or undefined if unable to authenticate.
 */
export async function authenticate(verification_uri: string, user_code: string) {
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

    const always = true;

    while (always) {
        await sleep(1500);
        const url = authWindow?.webContents?.getURL();
        if (url.includes("&status=")) {
            break;
        }
    }

    authWindow?.destroy();
    window?.webContents?.send("hideModalMessage");
}
