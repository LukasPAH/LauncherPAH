import * as settings from "../../settings";
import fs from "fs";
import * as child_process from "child_process";
import { getVersionFolderFromName } from "../../managers/profile/readProfiles";
import { getBackendVersionDB } from "../../managers/version/availableVersions";
import { downloadVersion } from "./downloadVersion";
import path from "path";
import { isJunction } from "../../utils/isJunction";

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
        if (!profile.version.toLowerCase().includes("sideloaded")) await downloadVersion(index, profile);
    }
    const profileFolder = path.join(settings.profilesLocation, profile.name);
    const releaseFolder = profile.version.toLowerCase().includes("preview") ? settings.GDKPreviewUsersFolder : settings.GDKReleaseUsersFolder;
    const isJunct = await isJunction(releaseFolder);
    if (isJunct) {
        fs.unlink(releaseFolder, (error) => {
            if (error !== null) console.log(error);
        });
    }
    fs.symlink(profileFolder, releaseFolder, "junction", (error) => {
        if (error !== null) console.log(error);
    });
    const versionLocation = settings.installationsLocation + "\\" + versionFolder + "\\Minecraft.Windows.exe";
    if (fs.existsSync(versionLocation)) child_process.spawn(versionLocation, { detached: true, stdio: "ignore" });
    settings.updateLastLaunchedProfileName(profile.name);
}
