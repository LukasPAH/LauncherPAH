import { BrowserWindow } from "electron";
import { download } from "electron-dl";
import fs from "fs";
import { isVersionInstalled } from "../../managers/version/readVersions";
import { install } from "../../managers/version/install";
import { getBackendVersionDB } from "../../managers/version/availableVersions";

export async function downloadVersion(DBIndex: number) {
    const window = BrowserWindow.getAllWindows()[0];
    window.webContents.send("startDownload", true);
    let filePath: string | undefined = undefined;

    const versionDB = getBackendVersionDB();
    const url = versionDB[DBIndex][0];

    const versionNameRegex = /[^/]*.msixvc$/;
    const versionName = url.match(versionNameRegex)[0].replace(".msixvc", "");

    if (isVersionInstalled(versionName)) {
        return;
    }

    if (!fs.existsSync(process.cwd() + "\\tmp_download\\" + versionName + ".msixvc")) {
        await download(window, url, {
            directory: process.cwd() + "\\tmp_download",
            onProgress(progress) {
                window.webContents.send("downloadProgress", progress);
            },
            onCompleted(file) {
                filePath = file.path;
                window.webContents.send("downloadCompleted", undefined);
            },
        });
        if (filePath === undefined) return;
    } else {
        filePath = process.cwd() + "\\tmp_download\\" + versionName + ".msixvc";
    }

    const isBeta = versionName.toLowerCase().includes("minecraftwindowsbeta");

    await install(filePath, window, isBeta);
}
