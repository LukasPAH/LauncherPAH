import * as consts from "../../consts";
import fs from "fs";
import { getInstalledVersions } from "../../managers/version/readVersions";
import * as child_process from "child_process";

export function launchInstalledVersion(index: number) {
    const versions = getInstalledVersions();
    const version = versions[index];
    launchVersion(version);
}

export function launchVersion(versionName: string) {
    const versionLocation = consts.installationsLocation + "\\" + versionName + "\\Minecraft.Windows.exe";
    if (fs.existsSync(versionLocation)) child_process.spawn(versionLocation, { detached: true, stdio: "ignore" });
    consts.updateLastLaunchedVersion(versionName);
}
