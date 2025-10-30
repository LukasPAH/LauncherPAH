import { BrowserWindow } from "electron";
import { download } from "electron-dl";
import fs from "fs";
import { isVersionInstalled } from "../../managers/version/readVersions";
import { install } from "../../managers/version/install";

export async function downloadVersion(_: Electron.IpcMainEvent, info: IDownloadProgressInfo) {
    const window = BrowserWindow.getAllWindows()[0];
    window.webContents.send("startDownload", true);
    let filePath: string | undefined = undefined;

    const versionNameRegex = /[^/]*.msixvc$/;
    const versionName = info.url.match(versionNameRegex)[0].replace(".msixvc", "");

    if (isVersionInstalled(versionName)) {
        return;
    }

    if (!fs.existsSync(process.cwd() + "\\data\\" + versionName + ".msixvc")) {
        await download(window, info.url, {
            directory: process.cwd() + "\\data",
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
        filePath = process.cwd() + "\\data\\" + versionName + ".msixvc";
    }

    const isBeta = versionName.includes("MinecraftWindowsBeta");

    await install(filePath, window, isBeta);
}
