import { BrowserWindow } from "electron";
import * as settings from "../../settings";
import * as fsAsync from "fs/promises";
import fs from "fs";

const installLocation = settings.launcherLocation + "\\installations";

const installedVersions: string[] = [];

export async function readInstalledVersions(): Promise<void> {
    const window = BrowserWindow.getAllWindows()[0];

    const installations = await fsAsync.readdir(installLocation, { recursive: false });

    const installedVersionsForUI: string[] = [];

    installations.forEach((installation) => {
        if (fs.existsSync(installLocation + "\\" + installation + "\\Minecraft.Windows.exe")) {
            const type = installation.toLowerCase().includes("minecraftwindowsbeta") ? "Preview " : "Release ";
            const sideloadedText = installation.toLowerCase().includes("_sideloaded") ? " (sideloaded)" : "";
            installedVersionsForUI.push(type + prettifyVersionNumbers(installation) + sideloadedText);
            installedVersions.push(installation);
        }
    });

    window.webContents.send("installedVersions", installedVersionsForUI);
}

export function prettifyVersionNumbers(version: string): string {
    version = version.toLowerCase().replace("microsoft.minecraftuwp_", "").replace("microsoft.minecraftwindowsbeta_", "").replace(".0_x64__8wekyb3d8bbwe", "").replace("_sideloaded", "");
    const majorVersion = version.slice(0, -2);
    const minorVersion = version.slice(-2);
    return majorVersion + "." + minorVersion;
}

export function uglifyVersionNumbers(version: string) {
    version = version.replace("Release ", "").replace("Preview ", "");
    const majorVersion = version.slice(0, -3);
    const minorVersion = version.slice(-2);
    return majorVersion + minorVersion;
}

export function isVersionInstalled(name: string): boolean {
    if (fs.existsSync(installLocation + "\\" + name + "\\Minecraft.Windows.exe")) return true;
    return false;
}

export function getInstalledVersions() {
    return installedVersions;
}

export async function removeInstalledVersion(version: string) {
    await fsAsync.rm(installLocation + "\\" + version, { recursive: true });

    const index = installedVersions.findIndex((value) => {
        return value === version;
    });

    if (index !== -1) {
        installedVersions.splice(index, 1);
    }

    await readInstalledVersions();
}

export async function addInstallation(version: string) {
    installedVersions.push(version);
    installedVersions.sort();
    await readInstalledVersions();
}
