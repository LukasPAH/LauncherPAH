import { BrowserWindow } from "electron";
import { installationsLocation } from "../../settings";
import * as fsAsync from "node:fs/promises";
import * as fs from "fs";
import * as path from "path";
import { prettifyVersionNumbers } from "./readVersions";

const versionDB = "https://raw.githubusercontent.com/LukasPAH/minecraft-windows-gdk-version-db/refs/heads/main/historical_versions.json";

let backendVersionDB: [string[], string][] = [];
const cachedVersions: [string[], string][] = [];

export async function getBackendVersionDB() {
    if (backendVersionDB.length === 0) await getAvailableVersions();
    return backendVersionDB;
}

export async function getLatestRelease() {
    await getBackendVersionDB();
    const releaseVersions = backendVersionDB.filter((value) => value[1].includes("Release") && !value[1].toLowerCase().includes("sideloaded"));

    const latestRelease = releaseVersions[releaseVersions.length - 1];
    const latestReleaseName = latestRelease[1];
    return latestReleaseName;
}

export async function getLatestPreview() {
    await getBackendVersionDB();
    const releaseVersions = backendVersionDB.filter((value) => value[1].includes("Preview"));

    const latestPreview = releaseVersions[releaseVersions.length - 1];
    const latestPreviewName = latestPreview[1];
    return latestPreviewName;
}

export async function getAvailableVersions() {
    const window = BrowserWindow.getAllWindows()[0];
    try {
        const response = await fetch(versionDB, {
            headers: {
                Accept: "application/json", // Request JSON response
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = (await response.json()) as IHistoricalVersionsJSON;
        const versionNamesForUI: string[] = [];

        backendVersionDB = [];
        for (const previewVersions of jsonData.previewVersions) {
            versionNamesForUI.push(previewVersions.version);
            backendVersionDB.push([previewVersions.urls, previewVersions.version]);
            cachedVersions.push([previewVersions.urls, previewVersions.version]);
        }
        for (const releaseVersion of jsonData.releaseVersions) {
            versionNamesForUI.push(releaseVersion.version);
            backendVersionDB.push([releaseVersion.urls, releaseVersion.version]);
            cachedVersions.push([releaseVersion.urls, releaseVersion.version]);
        }

        const installations = await fsAsync.readdir(installationsLocation, { recursive: false });

        installations.forEach((installation) => {
            if (fs.existsSync(path.join(installationsLocation, installation, "Minecraft.Windows.exe"))) {
                const type = installation.toLowerCase().includes("minecraftwindowsbeta") ? "Preview " : "Release ";
                const isSideLoaded = installation.toLowerCase().includes("_sideloaded");
                if (!isSideLoaded) return;
                const prettyName = type + prettifyVersionNumbers(installation) + (isSideLoaded ? " (Sideloaded)" : "");
                versionNamesForUI.push(prettyName);
                backendVersionDB.push([[], prettyName]);
            }
        });

        backendVersionDB.sort((a, b) => {
            const nameA = a[1].replace("Preview ", "").replace("Release ", "");
            const nameB = b[1].replace("Preview ", "").replace("Release ", "");
            return nameA.localeCompare(nameB);
        });
        versionNamesForUI.sort((a, b) => {
            const nameA = a.replace("Preview ", "").replace("Release ", "");
            const nameB = b.replace("Preview ", "").replace("Release ", "");
            return nameA.localeCompare(nameB);
        });

        window.webContents.send("availableVersions", versionNamesForUI);
    } catch (error) {
        console.error("Error fetching external JSON:", error);
    }
}
