import { BrowserWindow } from "electron";
import * as consts from "../../consts";
import * as fsAsync from "fs/promises";
import fs from "fs";

const installLocation = consts.launcherLocation + "\\installations";

const installedVersions: string[] = [];

export async function readInstalledVersions(): Promise<void> {
    const window = BrowserWindow.getAllWindows()[0];

    const installations = await fsAsync.readdir(installLocation, { recursive: false });

    const installedVersionsForUI: string[] = [];

    installations.forEach((installation) => {
        if (fs.existsSync(installLocation + "\\" + installation + "\\Minecraft.Windows.exe")) {
            installedVersionsForUI.push(prettifyVersionNumbers(installation));
            installedVersions.push(installation);
        }
    });

    window.webContents.send("installedVersions", installedVersionsForUI);
}

function prettifyVersionNumbers(version: string): string {
    version = version.toLowerCase().replace("microsoft.minecraftuwp_", "").replace("microsoft.minecraftwindowsbeta_", "").replace(".0_x64__8wekyb3d8bbwe", "").replace("_sideloaded", "");
    const majorVersion = version.slice(0, -2);
    const minorVersion = version.slice(-2);
    return majorVersion + "." + minorVersion;
}

export function isVersionInstalled(name: string): boolean {
    if (fs.existsSync(installLocation + "\\" + name + "\\Minecraft.Windows.exe")) return true;
    return false;
}

export function getInstalledVersions() {
    return installedVersions;
}
