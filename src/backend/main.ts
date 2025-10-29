import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import { download } from "electron-dl";
import { run } from "./powershell";
import fs from "fs";
import * as fsAsync from "fs/promises";
import * as consts from "./consts";
import { moveExecutable } from "./move";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
    app.quit();
}

const createWindow = async () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            defaultFontFamily: {
                standard: "Roboto",
            },
        },
    });

    mainWindow.removeMenu();
    mainWindow.setBackgroundColor("#212322");

    // and load the index.html of the app.
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
        mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
    }

    mainWindow.webContents.openDevTools();

    // Center the window.
    mainWindow.center();

    return mainWindow;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
    await createWindow();
    ipcMain.on("readVersions", async () => {
        await readInstalledVersions();
    });
    ipcMain.on("download", mainDownload);
    ipcMain.on("filePick", pickFile);
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
    // There can only be one.
    if (BrowserWindow.getAllWindows().length === 1) {
        app.quit();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

async function readInstalledVersions(): Promise<void> {
    const window = BrowserWindow.getAllWindows()[0];

    const installedVersions: string[] = [];

    const installLocation = consts.launcherLocation + "\\installations";

    const installations = await fsAsync.readdir(installLocation, { recursive: false });

    installations.forEach((installation) => {
        if (fs.existsSync(installLocation + "\\" + installation + "\\Minecraft.Windows.exe")) installedVersions.push(prettifyVersionNumbers(installation));
    });

    window.webContents.send("installedVersions", installedVersions);
}

function prettifyVersionNumbers(version: string): string {
    version = version.toLowerCase().replace("microsoft.minecraftuwp_", "").replace("microsoft.minecraftwindowsbeta_", "").replace(".0_x64__8wekyb3d8bbwe", "").replace("_sideloaded", "");
    const majorVersion = version.slice(0, -2);
    const minorVersion = version.slice(-2);
    return majorVersion + "." + minorVersion;
}

async function pickFile() {
    const window = BrowserWindow.getAllWindows()[0];

    const chosenFiles = await dialog.showOpenDialog(null, { properties: ["openFile"], title: "Open Custom MSIXVC", filters: [{ extensions: ["msixvc"], name: "" }] });
    const chosenFile = chosenFiles.filePaths[0];
    if (chosenFile === undefined || chosenFile === null) return;
    if (!chosenFile.endsWith(".msixvc")) return;

    const isBeta = chosenFile.toLowerCase().includes("minecraftwindowsbeta");

    window.webContents.send("downloadCompleted", undefined);
    await install(chosenFile, window, isBeta, true);
}

function isVersionInstalled(name: string): boolean {
    for (const installedVersion of consts.localData.installed_versions) {
        if (installedVersion.name.endsWith(name)) return true;
    }
    return false;
}

async function mainDownload(_: Electron.IpcMainEvent, info: IDownloadProgressInfo) {
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

async function register(file: string, previewLocation: string) {
    await run(`Add-AppxPackage "${file}" -Volume '${consts.drive}:\\XboxGames'`);
    // Sometimes registration fails for whatever reason. Just keep retrying until it succeeds.
    if (!fs.existsSync(previewLocation)) await register(file, previewLocation);
}

function pushNewVersion(version: ILocalVersion) {
    for (const installedVersion of consts.localData.installed_versions) {
        if (installedVersion.name === version.name) return;
    }
    consts.localData.installed_versions.push(version);
    fs.writeFileSync(process.env.APPDATA + "\\LauncherPAH\\data\\local_data.json", JSON.stringify(consts.localData, null, 4));
}

async function install(file: string, window: Electron.BrowserWindow, isBeta: boolean, sideloaded = false) {
    const versionNameRegex = /[^\\]*.msixvc$/;
    const versionName = file.match(versionNameRegex)[0].replace(".msixvc", "");
    const removeAppxCommand = `$name = (Get-AppxPackage -Name "${isBeta ? consts.previewPackageName : consts.releasePackageName}").PackageFullName; Remove-AppxPackage -Package $name;`;

    const defaultLocation = isBeta ? consts.defaultPreviewLocation : consts.defaultReleaseLocation;

    try {
        await run(removeAppxCommand);
    } catch (e) {
        //
    }

    await register(file, defaultLocation);

    window.webContents.send("progressStage", "copy");

    const targetLocation = consts.installationsLocation + "\\" + versionName + (sideloaded ? "_sideloaded" : "" );
    if (!fs.existsSync(targetLocation)) await fsAsync.mkdir(targetLocation);

    // Move the executable first.
    await run(moveExecutable(defaultLocation, targetLocation));

    // Node JS' copy and delete is too slow, opt for Windows' built in robocopy
    try {
        await run(`robocopy "${defaultLocation}" "${targetLocation}" /XF *.exe appxmanifest.xml /E /MOVE /MT:4 /R:3 /W:5 /NFL /NDL`);
    } catch {
        //
    }

    window.webContents.send("progressStage", "unregister");
    await run(removeAppxCommand);
    window.webContents.send("progressStage", "cleanup");
    if (!sideloaded) await fsAsync.rm(file);
    pushNewVersion({ name: versionName, path: targetLocation });
    window.webContents.send("progressStage", "idle");
}
