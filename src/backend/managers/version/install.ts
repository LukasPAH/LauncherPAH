import * as consts from "../../consts";
import * as fsAsync from "fs/promises";
import fs from "fs";
import { run } from "../../utils/powershell";
import { moveExecutable } from "../../utils/move";
import { readInstalledVersions } from "./readVersions";
import { launchVersion } from "../../events/responses/launchVersion";

export async function install(file: string, window: Electron.BrowserWindow, isBeta: boolean, sideloaded = false) {
    const versionNameRegex = /[^\\]*.msixvc$/;
    const versionName = file.match(versionNameRegex)[0].replace(".msixvc", "");
    const removeAppxCommand = `$name = (Get-AppxPackage -Name "${isBeta ? consts.previewPackageName : consts.releasePackageName}").PackageFullName; Remove-AppxPackage -Package $name;`;

    const defaultLocation = isBeta ? consts.getDefaultPreviewLocation() : consts.getReleaseLocation();

    try {
        await run(removeAppxCommand);
    } catch (e) {
        //
    }

    await register(file, defaultLocation, consts.getDrive());

    window.webContents.send("progressStage", "Moving files to installation folder...");

    const targetLocation = consts.installationsLocation + "\\" + versionName + (sideloaded ? "_sideloaded" : "");
    if (!fs.existsSync(targetLocation)) await fsAsync.mkdir(targetLocation);

    // Move the executable first.
    await run(moveExecutable(defaultLocation, targetLocation));

    // Node JS' copy and delete is too slow, opt for Windows' built in robocopy
    try {
        await run(`robocopy "${defaultLocation}" "${targetLocation}" /XF *.exe appxmanifest.xml /E /MOVE /MT:4 /R:3 /W:5 /NFL /NDL`);
    } catch {
        //
    }

    window.webContents.send("progressStage", "Unregistering package...");
    await run(removeAppxCommand);
    window.webContents.send("progressStage", "Cleaning up...");
    if (!sideloaded) await fsAsync.rm(file);
    const tempFolder = process.cwd() + "\\tmp_download";
    if (fs.existsSync(tempFolder))
        fs.rm(tempFolder, { force: true, recursive: true }, () => {
            0;
        });
    await readInstalledVersions();
    consts.updateLastLaunchedVersion(versionName);
    launchVersion(versionName);
    window.webContents.send("progressStage", "idle");
}

async function register(file: string, previewLocation: string, drive: Drive) {
    await run(`Add-AppxPackage "${file}" -Volume '${drive}:\\XboxGames'`);
    // Sometimes registration fails for whatever reason. Just keep retrying until it succeeds.
    if (!fs.existsSync(previewLocation)) await register(file, previewLocation, drive);
}
