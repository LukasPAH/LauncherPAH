import * as fs from "node:fs";
import * as fsAsync from "node:fs/promises";
import path from "path";
import * as settings from "../../settings";
import { getVersionFolderFromName } from "../../managers/profile/readProfiles";
import { run, spawnDetached, umuFlatpakRun } from "../../utils/bash";
import * as tar from "tar";
import { download } from "electron-dl";
import { SSL_CERTS_LINK, UMU_LINK } from "../../consts";

import { installProton } from "../../managers/proton/install";
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

    const environmentVariables: Record<string, string> = {};

    if (protonOptions?.enableWayland === true) {
        environmentVariables["PROTON_ENABLE_WAYLAND"] = "1";
    }
    if (protonOptions?.enableHDR === true) {
        environmentVariables["PROTON_ENABLE_HDR"] = "1";
    }
    if (protonOptions?.enableLogging === true) {
        environmentVariables["PROTON_LOG"] = "1";
    }

    const protonFolder = path.join(settings.launcherLocation, "proton", protonOptions.protonGDKVersion);

    const isFlatpak = !!process.env.FLATPAK_ID;

    environmentVariables["PROTONPATH"] = `'${protonFolder}/'`;
    environmentVariables["PROTON_VERB"] = "run";
    environmentVariables["WINEPREFIX"] = `'${profileFolder}'`;
    let environmentVariablesString = "";
    for (const [key, value] of Object.entries(environmentVariables)) {
        environmentVariablesString += `${key}=${value} `;
    }
    if (!fs.existsSync(path.join(profileFolder, "drive_c", "Program Files", "Microsoft GameInput", "x64"))) {
        if (isFlatpak) {
            await umuFlatpakRun(umuBinary, environmentVariables, [inputInstallerLocation]);
        } else {
            await run(`${environmentVariablesString} ${umuBinary} ${inputInstallerLocation}`);
        }
    }

    const isEditor = profile.editor;
    let minecraftUriPrefix = "minecraft";
    if (profile.version.toLocaleLowerCase().includes("preview")) {
        minecraftUriPrefix = "minecraft-preview";
    }

    if (isFlatpak) {
        const args: string[] = [versionLocation];
        if (isEditor) {
            args.push(`${minecraftUriPrefix}://creator/?Editor=true`);
        }
        umuFlatpakRun(umuBinary, environmentVariables, args);
    } else {
        let args = "";
        if (isEditor) {
            args = ` ${minecraftUriPrefix}://creator/?Editor=true`;
        }
        spawnDetached(`${environmentVariablesString} ${umuBinary} ${versionLocation}${args}`);
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
