import { BrowserWindow } from "electron";
import * as settings from "../../settings";
import * as fsAsync from "fs/promises";
import fs from "fs";
import path from "path";

const versionRegex = /(\d+)\.(\d+)\.(\d+)$/;
const calVerStartNumber = 26;
const installLocation = path.join(settings.launcherLocation, "installations");

let installedVersions: string[] = [];

export async function readInstalledVersions(): Promise<void> {
    const window = BrowserWindow.getAllWindows()[0];

    const installations = await fsAsync.readdir(installLocation, { recursive: false });

    const installedVersionsForUI: string[] = [];

    installations.forEach((installation) => {
        if (fs.existsSync(path.join(installLocation, installation, "Minecraft.Windows.exe"))) {
            const type = installation.toLowerCase().includes("minecraftwindowsbeta") ? "Preview " : "Release ";
            const sideloadedText = installation.toLowerCase().includes("_sideloaded") ? " (sideloaded)" : "";
            const prettyVersion = prettifyVersionNumbers(installation);
            if (prettyVersion === undefined) return;
            installedVersionsForUI.push(type + prettyVersion + sideloadedText);
            installedVersions.push(installation);
        }
    });

    window.webContents.send("installedVersions", installedVersionsForUI);
}

export function prettifyVersionNumbers(version: string): string | undefined {
    version = version
        .toLowerCase()
        .replace("microsoft.minecraftuwp_", "")
        .replace("microsoft.minecraftwindowsbeta_", "")
        .replace(".0_x64__8wekyb3d8bbwe", "")
        .replace("_sideloaded", "");
    const versionMatch = version.match(versionRegex);

    if (versionMatch === null) {
        return;
    }

    const majorVersion = versionMatch[1];
    if (majorVersion === undefined) {
        return;
    }

    const minorVersion = versionMatch[2];
    if (minorVersion === undefined) {
        return;
    }

    const patchVersionUnprocessed = versionMatch[3];
    if (patchVersionUnprocessed === undefined) {
        return;
    }

    const patchVersion = (parseInt(patchVersionUnprocessed) / 100).toFixed(2);

    let versionString = `${majorVersion}.${minorVersion}.${patchVersion}`;
    if (parseInt(minorVersion) >= calVerStartNumber) {
        versionString = `${minorVersion}.${patchVersion}`;
    }

    return versionString;
}

export function uglifyVersionNumbers(version: string): string | undefined {
    version = version.replace("Release ", "").replace("Preview ", "").replace(" (Sideloaded)", "");
    const versionMatch = version.match(versionRegex);

    if (versionMatch === null) {
        return;
    }
    if (versionMatch === null) {
        return;
    }

    const majorVersion = versionMatch[1];
    if (majorVersion === undefined) {
        return;
    }

    const minorVersion = versionMatch[2];
    if (minorVersion === undefined) {
        return;
    }

    const patchVersion = versionMatch[3];
    if (patchVersion === undefined) {
        return;
    }

    const unprocessedPatchVersion = `${minorVersion}.${patchVersion}`;
    const parsedPatchVersion = Math.round(parseFloat(unprocessedPatchVersion) * 100);
    return `1.${majorVersion}.${parsedPatchVersion}.0`;
}

export function isVersionInstalled(name: string): boolean {
    if (fs.existsSync(path.join(installLocation, name, "Minecraft.Windows.exe"))) return true;
    return false;
}

export function getInstalledVersions() {
    return installedVersions;
}

export async function removeInstalledVersion(version: string) {
    await fsAsync.rm(path.join(installLocation, version), { recursive: true });

    const index = installedVersions.findIndex((value) => {
        return value === version;
    });

    if (index !== -1) {
        installedVersions.splice(index, 1);
    }

    await readInstalledVersions();
}

export async function addInstallation() {
    installedVersions = [];
    await readInstalledVersions();
}
