import { tryRun, run } from "../../utils/bash";
import * as settings from "../../settings";
import path from "node:path";
import * as fsAsync from "node:fs/promises";
import * as fs from "node:fs";
import { basename } from "path";
import { download, File } from "electron-dl";
import { MINGW_CURL_LINK, XVDTOOL_LINK } from "../../consts";
import * as tar from "tar";
import { Unzip } from "zip-lib";

import { window } from "../../main";
import { editConfigFile } from "../../utils/editGameConfig";
import { guidToBytes, hexToBytes } from "../../utils/hex";
import { addInstallation } from "./readVersions";

const XvdToolExtractionFolderName = "linux-x64";

async function writeTestCik(targetPath: string) {
    const testCikUUID = "33EC8436-5A0E-4F0D-B1CE-3F29C3955039";
    const testCik = "217587B8E319459CBA2EF26F8DE68EA89AB6DC0FBC1142D09F4498B0BEE22496";

    const uuidBytes = guidToBytes(testCikUUID);
    const cikBytes = hexToBytes(testCik);

    const result = new Uint8Array(uuidBytes.length + cikBytes.length);
    result.set(uuidBytes, 0);
    result.set(cikBytes, uuidBytes.length);

    const fileName = testCikUUID.toLowerCase() + ".cik";

    if (!fs.existsSync(targetPath)) {
        await fsAsync.mkdir(targetPath, { recursive: true });
    }

    const cikFile = path.join(targetPath, fileName);

    await fsAsync.writeFile(cikFile, result);
}

async function downloadXvdTool(targetPath: string) {
    if (window === null) {
        return;
    }

    const xvdToolBinary = path.join(targetPath, "XvdTool.Streaming");
    if (fs.existsSync(xvdToolBinary)) {
        return;
    }

    if (!fs.existsSync(targetPath)) {
        await fsAsync.mkdir(targetPath, { recursive: true });
    }

    const promises: Promise<void>[] = [];
    await download(window, XVDTOOL_LINK, {
        directory: targetPath,
        onCompleted(file) {
            const unpack = unpackXvdTool(file, targetPath);
            promises.push(unpack);
        },
    });
    await Promise.all(promises);
}

export async function installLinux(file: string, window: Electron.BrowserWindow, isBeta: boolean, sideloaded = false, profile?: IProfile) {
    const hasDependenciesRequirement = await hasDependencies(window);
    if (!hasDependenciesRequirement) {
        return;
    }
    settings.setInstallationLock(true);
    const fileName = basename(file);
    const finalLocation = path.join(settings.installationsLocation, fileName.replace(".msixvc", "") + (sideloaded ? "_sideloaded" : ""));
    const XvdToolExtractionLocation = path.join(settings.launcherLocation, "XvdTool");
    const XvdToolLocation = path.join(settings.launcherLocation, "XvdTool", XvdToolExtractionFolderName);
    const cikLocation = path.join(XvdToolExtractionLocation, XvdToolExtractionFolderName, "Cik");

    window.webContents.send("progressStage", "Downloading dependencies.");
    await downloadXvdTool(XvdToolLocation);
    await writeTestCik(cikLocation);

    window.webContents.send("progressStage", "Installing game files...");
    const result = await tryUnpackMsixvc(XvdToolLocation, file, finalLocation);
    if (result === false) {
        // TODO: add proper logging here based on unpacking results.
        return;
    }
    await editConfigFile(finalLocation);

    const windowsAppBootStrapDll = path.join(finalLocation, "Microsoft.WindowsAppRuntime.Bootstrap.dll");
    if (sideloaded && fs.existsSync(windowsAppBootStrapDll)) {
        await fsAsync.rm(windowsAppBootStrapDll);
    }

    await addInstallation();

    window.webContents.send("progressStage", "idle");
    settings.setInstallationLock(false);
}

async function hasDependencies(window: Electron.BrowserWindow): Promise<boolean> {
    let errorString = "Missing dependencies: ";
    let shouldError = false;

    const hasDotNet = await tryRun("dotnet --info");
    if (!hasDotNet) {
        errorString += "dotnet runtime (9.0.x).";
        shouldError = true;
    }

    if (shouldError) {
        errorString = errorString.replace(/, $/, "");
        console.log(errorString);
        window.webContents.send("progressStage", "idle");
        window.webContents.send("showModalMessage", errorString);
        settings.setInstallationLock(false);
    }

    return !shouldError;
}

async function installMingwCurl() {
    if (window === null) {
        return;
    }
    const promises: Promise<void>[] = [];
    const tempDownloadPath = path.join(settings.launcherLocation, "tmp_download");
    await download(window, MINGW_CURL_LINK, {
        directory: tempDownloadPath,
        onCompleted(file) {
            const unpack = unpackMingCurl(file);
            promises.push(unpack);
        },
    });
    await Promise.all(promises);
}

async function unpackMingCurl(file: File) {
    const dllName = "libcurl-4.dll";
    const tempDownloadPath = path.join(settings.launcherLocation, "tmp_download");
    await tar.extract({
        file: file.path,
        cwd: tempDownloadPath,
        filter: (path) => {
            return path.endsWith(dllName);
        },
        onReadEntry(entry) {
            const dirname = path.dirname(entry.path);
            entry.path = entry.path.replace(dirname, "");
        },
    });
    await fsAsync.rm(file.path);
    const libCurlDll = path.join(tempDownloadPath, dllName);
    const dataFolder = path.join(settings.launcherLocation, "data");
    await fsAsync.copyFile(libCurlDll, path.join(dataFolder, "XCurl.dll"));
    await fsAsync.rm(libCurlDll);
}

async function swapXCurl(finalInstallationFolder: string) {
    const xCurlDll = path.join(settings.launcherLocation, "data", "XCurl.dll");
    const targetXCurlDll = path.join(finalInstallationFolder, "XCurl.dll");

    if (!fs.existsSync(xCurlDll)) {
        await installMingwCurl();
    }

    await fsAsync.copyFile(xCurlDll, targetXCurlDll);
}

async function unpackXvdTool(file: File, targetLocation: string) {
    const unzip = new Unzip();
    await unzip.extract(file.path, targetLocation);
    await fsAsync.rm(file.path);
}

async function tryUnpackMsixvc(xvdToolPath: string, filePath: string, targetPath: string): Promise<boolean> {
    const xvdBinary = path.join(xvdToolPath, "XvdTool.Streaming");
    const result = await tryRun(`cd "${xvdToolPath}" && "${xvdBinary}" extract "${filePath}" -o "${targetPath}"`);
    if (result === false) {
        return false;
    }

    await swapXCurl(targetPath);

    return true;
}
