import { BrowserWindow } from "electron";

const versionDB = "https://raw.githubusercontent.com/LukasPAH/minecraft-windows-gdk-version-db/refs/heads/main/historical_versions.json";

let backendVersionDB: [string[], string][] = [];

// @remarks Gets the version database. [url, version name]
export async function getBackendVersionDB() {
    if (backendVersionDB.length === 0) await getAvailableVersions();
    return backendVersionDB;
}

export async function getLatestRelease() {
    await getBackendVersionDB();
    const releaseVersions = backendVersionDB.filter((value) => value[1].includes("Release"));

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
        }
        for (const releaseVersion of jsonData.releaseVersions) {
            versionNamesForUI.push(releaseVersion.version);
            backendVersionDB.push([releaseVersion.urls, releaseVersion.version]);
        }

        window.webContents.send("availableVersions", versionNamesForUI);
    } catch (error) {
        console.error("Error fetching external JSON:", error);
    }
}
