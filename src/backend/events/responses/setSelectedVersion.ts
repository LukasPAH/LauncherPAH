import { updateLastLaunchedVersion } from "../../consts";
import { getInstalledVersions, prettifyVersionNumbers } from "../../managers/version/readVersions";
import { BrowserWindow } from "electron";

export async function setSelectedVersion(index: number) {
    const window = BrowserWindow.getAllWindows()[0];
    const versions = getInstalledVersions();
    updateLastLaunchedVersion(versions[index]);

    const versionNumber = prettifyVersionNumbers(versions[index]);

    let type = "Release ";
    if (versions[index].toLowerCase().includes("minecraftwindowsbeta")) type = "Preview ";
    const sideloadedText = versions[index].toLowerCase().includes("_sideloaded") ? " (sideloaded)" : "";

    window.webContents.send("selectedVersion", type + versionNumber + sideloadedText);
}

export async function setSelectedVersionOnAppStart(versionName: string | false) {
    const window = BrowserWindow.getAllWindows()[0];

    if (versionName === false) {
        window.webContents.send("selectedVersion", versionName);
        return;
    }

    const versionNumber = prettifyVersionNumbers(versionName);

    let type = "Release ";
    if (versionName.toLowerCase().includes("minecraftwindowsbeta")) type = "Preview ";
    const sideloadedText = versionName.toLowerCase().includes("_sideloaded") ? " (sideloaded)" : "";

    window.webContents.send("selectedVersion", type + versionNumber + sideloadedText);
}
