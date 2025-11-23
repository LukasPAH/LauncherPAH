import * as settings from "../../settings";
import fs from "fs";
import fsAsync from "fs/promises"
import * as child_process from "child_process";
import { getVersionFolderFromName } from "../../managers/profile/readProfiles";
import { getBackendVersionDB } from "../../managers/version/availableVersions";
import { downloadVersion } from "./downloadVersion";
import path from "path";
import { isJunction } from "../../utils/isJunction";
import { isPreviewRunning, isReleaseRunning } from "../../utils/isGameRunning";

export async function launchInstalledVersion(profile: IProfile) {
    await launchVersion(profile);
}

export async function launchVersion(profile: IProfile, customLaunchCommand?: string) {
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
    const isGameRunning = profile.version.toLowerCase().includes("preview") ? await isPreviewRunning() : await isReleaseRunning();
    if (!isGameRunning) {
        if (isJunct) {
            await fsAsync.unlink(releaseFolder);
        }
        await fsAsync.symlink(profileFolder, releaseFolder, "junction");
    }
    const versionLocation = settings.installationsLocation + "\\" + versionFolder + "\\Minecraft.Windows.exe";
    if (fs.existsSync(versionLocation)) child_process.spawn(customLaunchCommand ?? versionLocation, { stdio: "ignore", shell: "powershell" });
    settings.updateLastLaunchedProfileName(profile.name);
}
