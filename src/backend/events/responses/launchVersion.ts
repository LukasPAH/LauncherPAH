import * as consts from "../../consts";
import fs from "fs";
import { run } from "../../utils/powershell";
import { getInstalledVersions } from "../../managers/version/readVersions";

export function launchInstalledVersion(index: number) {
    const versions = getInstalledVersions();
    const version = versions[index];
    launchVersion(version);
}

export function launchVersion(versionName: string) {
    const versionLocation = consts.installationsLocation + "\\" + versionName + "\\Minecraft.Windows.exe";
    if (fs.existsSync(versionLocation)) run(`& "${versionLocation}"`);
    consts.updateLastLaunchedVersion(versionName);
}
