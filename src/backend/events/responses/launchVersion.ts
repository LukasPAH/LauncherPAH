import * as settings from "../../settings";
import fs from "fs";
import { getInstalledVersions } from "../../managers/version/readVersions";
import * as child_process from "child_process";

export function launchInstalledVersion(index: number) {
    const versions = getInstalledVersions();
    const version = versions[index];
    launchVersion(version);
}

export function launchVersion(versionName: string) {
    const versionLocation = settings.installationsLocation + "\\" + versionName + "\\Minecraft.Windows.exe";
    if (fs.existsSync(versionLocation)) child_process.spawn(versionLocation, { detached: true, stdio: "ignore" });
    settings.updateLastLaunchedVersion(versionName);
}
