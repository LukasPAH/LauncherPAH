import { BrowserWindow, dialog } from "electron";
import { install } from "../../managers/version/install";
import { installLinux } from "../../managers/version/installLinux";
import { prettifyVersionNumbers } from "../../managers/version/readVersions";
import os from "node:os";

export async function pickFile() {
    const window = BrowserWindow.getAllWindows()[0];

    const chosenFiles = await dialog.showOpenDialog(null, {
        properties: ["openFile"],
        title: "Open Custom MSIXVC",
        filters: [{ extensions: ["msixvc"], name: "" }],
    });
    const chosenFile = chosenFiles.filePaths[0];
    if (chosenFile === undefined || chosenFile === null) return;
    if (!chosenFile.endsWith(".msixvc")) return;

    const isBeta = chosenFile.toLowerCase().includes("minecraftwindowsbeta");
    const previewOrRelease = isBeta ? "Preview " : "Release ";

    const versionNameRegex = /[^/]*.msixvc$/;
    const versionName = chosenFile.match(versionNameRegex)[0].replace(".msixvc", "");

    const versionNumber = prettifyVersionNumbers(versionName);

    window.webContents.send("downloadCompleted", previewOrRelease + versionNumber);
    if (os.platform() === "win32") {
        await install(chosenFile, window, isBeta, true);
    }
    if (os.platform() === "linux") {
        await installLinux(chosenFile, window, isBeta, true);
    }
}
