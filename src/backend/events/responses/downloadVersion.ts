import { BrowserWindow } from "electron";
import { download } from "electron-dl";
import * as path from "path";
import fs from "fs";
import { isVersionInstalled, prettifyVersionNumbers } from "../../managers/version/readVersions";
import { setInstallationLock } from "../../settings";
import { install } from "../../managers/version/install";
import { getBackendVersionDB } from "../../managers/version/availableVersions";
import os from "node:os";

export async function downloadVersion(DBIndex: number, profile: IProfile) {
    setInstallationLock(true);
    const window = BrowserWindow.getAllWindows()[0];
    window.webContents.send("startDownload", true);
    let filePath: string | undefined = undefined;

    const versionDB = await getBackendVersionDB();
    const url = versionDB[DBIndex][0][0];

    const versionNameRegex = /[^/]*.msixvc$/;
    const versionName = url.match(versionNameRegex)[0].replace(".msixvc", "");

    if (isVersionInstalled(versionName)) {
        setInstallationLock(false);
        return;
    }

    const fetchTimes: IURLFetchTimes[] = [];

    for (const urlToUse of versionDB[DBIndex][0]) {
        const startTime = Date.now();
        await fetch(urlToUse, {
            method: "HEAD",
        })
            .finally(() => {
                const requestTime = Date.now() - startTime;
                fetchTimes.push({ time: requestTime, url: urlToUse });
            })
            .catch(() => {
                setInstallationLock(false);
                return;
            });
    }

    const sortedTimes = fetchTimes.sort((a, b) => {
        return a.time - b.time;
    });

    const urlToUse = sortedTimes[0].url;

    const versionNumber = prettifyVersionNumbers(versionName);
    const previewOrRelease = versionName.toLowerCase().includes("minecraftwindowsbeta") ? "Preview " : "Release ";

    let dataLocation = process.env.APPDATA;
    if (os.platform() === "linux") {
        dataLocation = process.env.HOME;
    }

    const tempDownloadPath = path.join(dataLocation, "LauncherPAH", "tmp_download");

    if (!fs.existsSync(path.join(tempDownloadPath, versionName, ".msixvc"))) {
        await download(window, urlToUse, {
            directory: tempDownloadPath,
            onProgress(progress) {
                window.webContents.send("downloadProgress", progress, previewOrRelease + versionNumber);
            },
            onCompleted(file) {
                filePath = file.path;
                window.webContents.send("downloadCompleted", previewOrRelease + versionNumber);
            },
        });
        if (filePath === undefined) return;
    } else {
        filePath = path.join(tempDownloadPath, versionName, ".msixvc");
    }

    const isBeta = versionName.toLowerCase().includes("minecraftwindowsbeta");

    await install(filePath, window, isBeta, false, profile);
}
