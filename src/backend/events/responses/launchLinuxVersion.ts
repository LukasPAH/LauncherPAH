import * as fs from "node:fs";
import * as fsAsync from "node:fs/promises";
import path from "path";
import * as settings from "../../settings";
import { getVersionFolderFromName } from "../../managers/profile/readProfiles";
import { run, spawnDetached } from "../../utils/bash";
import * as tar from "tar";
import { download } from "electron-dl";
import { SSL_CERTS_LINK, UMU_LINK } from "../../consts";

import { installProton } from "../../managers/proton/install";
import { authenticate } from "./authenticate";
import { window } from "../../main";

export async function launchLinuxVersion(profile: IProfile, customLaunchCommand?: string) {
    const protonOptions = await installProton(profile);
    await installUmu();
    await installOpenSSLCert();
    const umuBinary = path.join(settings.launcherLocation, "umu", "umu-run");

    const profileFolder = path.join(settings.profilesLocation, profile.name);
    if (!fs.existsSync(profileFolder)) {
        await fsAsync.mkdir(profileFolder);
    }

    const versionFolder = await getVersionFolderFromName(profile.name);
    if (versionFolder === undefined) return;
    const versionLocation = path.join(settings.installationsLocation, versionFolder, "Minecraft.Windows.exe");
    const inputInstallerLocation = path.join(settings.installationsLocation, versionFolder, "installers", "GameInputRedist.msi");

    let environmentVariablesString = "";

    if (protonOptions?.enableWayland === true) {
        environmentVariablesString += "PROTON_ENABLE_WAYLAND=1 ";
    }
    if (protonOptions?.enableHDR === true) {
        environmentVariablesString += "PROTON_ENABLE_HDR=1 ";
    }
    if (protonOptions?.enableLogging === true) {
        environmentVariablesString += "PROTON_LOG=1 ";
    }

    const protonFolder = path.join(settings.launcherLocation, "proton", protonOptions.protonGDKVersion);

    environmentVariablesString += `PROTONPATH=${protonFolder}/ `;
    environmentVariablesString += `PROTON_VERB=run WINEPREFIX='${profileFolder}'`;
    if (!fs.existsSync(path.join(profileFolder, "drive_c", "Program Files", "Microsoft GameInput", "x64"))) {
        await run(`${environmentVariablesString} ${umuBinary} ${inputInstallerLocation}`);
    }

    const hasPrefix = await tryCreateAndAuthenticatePrefix(environmentVariablesString, umuBinary, profile);

    if (hasPrefix) {
        spawnDetached(`${environmentVariablesString} ${umuBinary} ${versionLocation}`);
    }

    settings.updateLastLaunchedProfileName(profile.name);
}

async function installUmu() {
    const binary = path.join(settings.launcherLocation, "umu", "umu-run");
    if (fs.existsSync(binary)) {
        return;
    }

    const tempDownloadPath = path.join(settings.launcherLocation, "tmp_download");

    const promises: Promise<void>[] = [];
    if (window === null) {
        return;
    }
    await download(window, UMU_LINK, {
        directory: tempDownloadPath,
        onCompleted(file) {
            const extraction = tar
                .extract({
                    file: file.path,
                    cwd: settings.launcherLocation,
                })
                .finally(() => {
                    fsAsync.rm(file.path);
                });
            promises.push(extraction);
        },
    });
    await Promise.all(promises);
}

async function installOpenSSLCert() {
    if (window === null) {
        return;
    }

    const certFolder = path.join(settings.installationsLocation, "etc", "ssl", "certs");
    if (!fs.existsSync(certFolder)) {
        await fsAsync.mkdir(certFolder, { recursive: true });
    }

    const bundleName = "ca-bundle.crt";
    const certificate = path.join(certFolder, bundleName);
    if (fs.existsSync(certificate)) {
        return;
    }

    const promises: Promise<void>[] = [];
    await download(window, SSL_CERTS_LINK, {
        directory: certFolder,
        onCompleted(file) {
            const renamedCert = path.join(path.dirname(file.path), bundleName);
            const rename = fsAsync.rename(file.path, renamedCert);
            promises.push(rename);
        },
    });
    await Promise.all(promises);
}

async function tryCreateAndAuthenticatePrefix(environmentVariablesString: string, umuBinary: string, profile: IProfile): Promise<boolean> {
    const profileFolder = path.join(settings.profilesLocation, profile.name);
    const userRegFile = path.join(profileFolder, "user.reg");
    if (!fs.existsSync(userRegFile)) {
        await run(`${environmentVariablesString} ${umuBinary} ""`, true);
    }
    const userRegFileContents = (await fsAsync.readFile(userRegFile)).toString();

    const XUserRegKey = "[Software\\\\Wine\\\\WineGDK\\\\XUser]";

    if (!userRegFileContents.includes(XUserRegKey)) {
        const authenticated = await authenticateAndUpdateUserRegistry(profile, userRegFileContents);
        return authenticated;
    }

    return true;
}

async function authenticateAndUpdateUserRegistry(profile: IProfile, registryContents: string): Promise<boolean> {
    const refreshToken = await authenticate();
    if (refreshToken === undefined) {
        return false;
    }

    const unixTime = Date.now();
    const epochDiff = 116_444_736_000_000_000n;

    const profileFolder = path.join(settings.profilesLocation, profile.name);
    const userRegFile = path.join(profileFolder, "user.reg");

    const regKey = `
[Software\\\\Wine\\\\WineGDK\\\\XUser] ${unixTime}
#time=${(BigInt(unixTime) * 10_000n * epochDiff).toString(16)}
"ClientId"="0000000040159362"
"RefreshToken"="${refreshToken}"
`;

    const newRegistry = registryContents + regKey;
    await fsAsync.writeFile(userRegFile, newRegistry);

    return true;
}
