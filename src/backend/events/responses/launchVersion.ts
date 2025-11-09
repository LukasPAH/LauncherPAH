import * as settings from "../../settings";
import fs from "fs";
import * as child_process from "child_process";
import { getVersionFolderFromName } from "../../managers/profile/readProfiles";
import { getBackendVersionDB } from "../../managers/version/availableVersions";
import { downloadVersion } from "./downloadVersion";

export async function launchInstalledVersion(profile: IProfile) {
    await launchVersion(profile);
}

export async function launchVersion(profile: IProfile) {
    const versionFolder = await getVersionFolderFromName(profile.name);
    if (!versionFolder) {
        const versions = await getBackendVersionDB();
        let index = 0;
        for (const [_, versionName] of versions) {
            if (versionName === profile.version) break;
            index++;
        }
        await downloadVersion(index, profile);
    }
    const versionLocation = settings.installationsLocation + "\\" + versionFolder + "\\Minecraft.Windows.exe";
    if (fs.existsSync(versionLocation)) child_process.spawn(versionLocation, { detached: true, stdio: "ignore" });
    settings.updateLastLaunchedProfileName(profile.name);
}
