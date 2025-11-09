import { updateLastLaunchedProfileName } from "../../settings";
import { getInstalledVersions, prettifyVersionNumbers } from "../../managers/version/readVersions";
import { BrowserWindow } from "electron";

export async function setSelectedProfile(profile: IProfile) {
    const window = BrowserWindow.getAllWindows()[0];
    updateLastLaunchedProfileName(profile.name);

    window.webContents.send("selectedProfile", profile);
}

export async function setSelectedProfileOnStart(profile: IProfile) {
    const window = BrowserWindow.getAllWindows()[0];

    window.webContents.send("selectedProfile", profile);
}
