import { BrowserWindow } from "electron";
import * as consts from "../../consts";
import * as fsAsync from "fs/promises";
import fs from "fs";

export async function readInstalledVersions(): Promise<void> {
    const window = BrowserWindow.getAllWindows()[0];

    const installedVersions: string[] = [];

    const installLocation = consts.launcherLocation + "\\installations";

    const installations = await fsAsync.readdir(installLocation, { recursive: false });

    installations.forEach((installation) => {
        if (fs.existsSync(installLocation + "\\" + installation + "\\Minecraft.Windows.exe")) installedVersions.push(prettifyVersionNumbers(installation));
    });

    window.webContents.send("installedVersions", installedVersions);
}

function prettifyVersionNumbers(version: string): string {
    version = version.toLowerCase().replace("microsoft.minecraftuwp_", "").replace("microsoft.minecraftwindowsbeta_", "").replace(".0_x64__8wekyb3d8bbwe", "").replace("_sideloaded", "");
    const majorVersion = version.slice(0, -2);
    const minorVersion = version.slice(-2);
    return majorVersion + "." + minorVersion;
}

export function isVersionInstalled(name: string): boolean {
    for (const installedVersion of consts.localData.installed_versions) {
        if (installedVersion.name.endsWith(name)) return true;
    }
    return false;
}