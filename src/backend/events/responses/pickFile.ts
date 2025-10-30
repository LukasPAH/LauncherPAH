import { BrowserWindow, dialog } from "electron";
import { install } from "../../managers/version/install";

export async function pickFile() {
    const window = BrowserWindow.getAllWindows()[0];

    const chosenFiles = await dialog.showOpenDialog(null, { properties: ["openFile"], title: "Open Custom MSIXVC", filters: [{ extensions: ["msixvc"], name: "" }] });
    const chosenFile = chosenFiles.filePaths[0];
    if (chosenFile === undefined || chosenFile === null) return;
    if (!chosenFile.endsWith(".msixvc")) return;

    const isBeta = chosenFile.toLowerCase().includes("minecraftwindowsbeta");

    window.webContents.send("downloadCompleted", undefined);
    await install(chosenFile, window, isBeta, true);
}
