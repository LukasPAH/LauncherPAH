import * as fs from "node:fs";
import * as fsAsync from "node:fs/promises";
import path from "path";
import * as settings from "../../settings";
import { getVersionFolderFromName } from "../../managers/profile/readProfiles";
import { run, spawnDetached } from "../../utils/bash";
import * as tar from "tar";
import { download } from "electron-dl";
import { UMU_LINK } from "../../consts";
import { BrowserWindow } from "electron";
import { installProton } from "../../managers/proton/install";

export async function launchLinuxVersion(profile: IProfile, customLaunchCommand?: string) {
    const protonOptions = await installProton(profile);
    await installUmu();
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

    spawnDetached(`${environmentVariablesString} ${umuBinary} ${versionLocation}`);

    settings.updateLastLaunchedProfileName(profile.name);
}

async function installUmu() {
    const window = BrowserWindow.getAllWindows()[0];
    const binary = path.join(settings.launcherLocation, "umu", "umu-run");
    if (fs.existsSync(binary)) {
        return;
    }

    const tempDownloadPath = path.join(settings.launcherLocation, "tmp_download");

    const promises: Promise<void>[] = [];
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
