import * as settings from "../../settings";
import * as fsAsync from "fs/promises";
import fs from "fs";
import { run } from "../../utils/powershell";
import { moveFontMetadataFile, moveExecutable } from "../../utils/move";
import { addInstallation } from "./readVersions";
import { launchVersion } from "../../events/responses/launchVersion";
import path from "path";
import os from "node:os";

export async function install(file: string, window: Electron.BrowserWindow, isBeta: boolean, sideloaded = false, profile?: IProfile) {
    settings.setInstallationLock(true);
    const versionNameRegex = /[^\\|\/]*.msixvc$/;
    const versionName = file.match(versionNameRegex)[0].replace(".msixvc", "");
    const removeAppxCommand = `$name = (Get-AppxPackage -Name "${isBeta ? settings.previewPackageName : settings.releasePackageName}").PackageFullName; Remove-AppxPackage -Package $name;`;

    const defaultLocation = isBeta ? settings.getDefaultPreviewLocation() : settings.getReleaseLocation();

    try {
        await run(removeAppxCommand);
    } catch (e) {
        //
    }

    const result = await register(file, defaultLocation, settings.getDrive());
    if (result === 1) {
        settings.setInstallationLock(false);
        throw new Error("Failed to install! Please try again later!");
    }

    window.webContents.send("progressStage", "Moving files to installation folder...");

    const targetLocation = path.join(settings.installationsLocation, versionName + (sideloaded ? "_sideloaded" : ""));
    if (!fs.existsSync(targetLocation)) await fsAsync.mkdir(targetLocation);

    // Move the executable first.
    await run(moveExecutable(defaultLocation, targetLocation));

    // Node JS' copy and delete is too slow, opt for Windows' built in robocopy
    try {
        await run(`robocopy "${defaultLocation}" "${targetLocation}" /XF *.exe appxmanifest.xml font_metadata.json /E /MOVE /MT:4 /R:3 /W:5 /NFL /NDL`);
    } catch {
        //
    }

    await fsAsync.cp(path.join(defaultLocation, "appxmanifest.xml"), path.join(targetLocation, "appxmanifest.xml"));

    await moveFontMetadataFile(defaultLocation, targetLocation);

    window.webContents.send("progressStage", "Unregistering package...");
    await run(removeAppxCommand);
    window.webContents.send("progressStage", "Cleaning up...");
    if (!sideloaded) await fsAsync.rm(file);

    let dataLocation = process.env.APPDATA;
    if (os.platform() === "linux") {
        dataLocation = path.join(process.env.HOME, "Games");
    }

    const tempFolder = path.join(dataLocation + "LauncherPAH", "tmp_download");
    if (fs.existsSync(tempFolder))
        fs.rm(tempFolder, { force: true, recursive: true }, () => {
            0;
        });
    if (profile !== undefined) settings.updateLastLaunchedProfileName(profile.name);
    await addInstallation();
    if (profile !== undefined) await launchVersion(profile);
    window.webContents.send("progressStage", "idle");
    settings.setInstallationLock(false);
}

async function register(file: string, previewLocation: string, drive: Drive) {
    try {
        await run(`Add-AppxPackage "${file}" -Volume '${drive}:\\XboxGames'`);
        // Sometimes registration doesn't complete fully. Just keep retrying until it succeeds.
        if (!fs.existsSync(previewLocation)) await register(file, previewLocation, drive);
        return 0;
    } catch (error) {
        // Installation failed, likely because the user doesn't own the game.
        return 1;
    }
}
