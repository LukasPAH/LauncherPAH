import { BrowserWindow } from "electron";

const versionDB = "https://raw.githubusercontent.com/LukasPAH/minecraft-windows-gdk-version-db/refs/heads/main/historical_versions.json";

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
        for (const previewVersions of jsonData.previewVersions) {
            versionNamesForUI.push(previewVersions.version);
        }
        window.webContents.send("availableVersions", versionNamesForUI);
    } catch (error) {
        console.error("Error fetching external JSON:", error);
    }
}
