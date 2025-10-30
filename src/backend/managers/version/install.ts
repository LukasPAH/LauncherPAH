import * as consts from "../../consts";
import * as fsAsync from "fs/promises";
import fs from "fs";
import { run } from "../../utils/powershell";
import { moveExecutable } from "../../utils/move";

export async function install(file: string, window: Electron.BrowserWindow, isBeta: boolean, sideloaded = false) {
    const versionNameRegex = /[^\\]*.msixvc$/;
    const versionName = file.match(versionNameRegex)[0].replace(".msixvc", "");
    const removeAppxCommand = `$name = (Get-AppxPackage -Name "${isBeta ? consts.previewPackageName : consts.releasePackageName}").PackageFullName; Remove-AppxPackage -Package $name;`;

    const defaultLocation = isBeta ? consts.defaultPreviewLocation : consts.defaultReleaseLocation;

    try {
        await run(removeAppxCommand);
    } catch (e) {
        //
    }

    await register(file, defaultLocation);

    window.webContents.send("progressStage", "copy");

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

    window.webContents.send("progressStage", "unregister");
    await run(removeAppxCommand);
    window.webContents.send("progressStage", "cleanup");
    if (!sideloaded) await fsAsync.rm(file);
    pushNewVersion({ name: versionName, path: targetLocation });
    window.webContents.send("progressStage", "idle");
}

async function register(file: string, previewLocation: string) {
    await run(`Add-AppxPackage "${file}" -Volume '${consts.drive}:\\XboxGames'`);
    // Sometimes registration fails for whatever reason. Just keep retrying until it succeeds.
    if (!fs.existsSync(previewLocation)) await register(file, previewLocation);
}

function pushNewVersion(version: ILocalVersion) {
    for (const installedVersion of consts.localData.installed_versions) {
        if (installedVersion.name === version.name) return;
    }
    consts.localData.installed_versions.push(version);
    fs.writeFileSync(process.env.APPDATA + "\\LauncherPAH\\data\\local_data.json", JSON.stringify(consts.localData, null, 4));
}
