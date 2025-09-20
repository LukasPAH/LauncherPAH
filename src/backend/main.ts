import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import { download } from "electron-dl";
import { run } from "./powershell";
import fs from "fs";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
    app.quit();
}

const createWindow = () => {
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

    // Center the window.
    mainWindow.center();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
    createWindow();
    ipcMain.on("download", mainDownload);
    ipcMain.on("install", install);
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
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

async function mainDownload(_: Electron.IpcMainEvent, info: IDownloadProgressInfo) {
    const window = BrowserWindow.getFocusedWindow();
    window.webContents.send("startDownload", true);
    await download(window, info.url, {
        directory: process.cwd() + "/data",
        onProgress(progress) {
            window.webContents.send("downloadProgress", progress);
        },
        onCompleted(_) {
            window.webContents.send("downloadCompleted", undefined);
        },
    });
}

const file = "D:\\Projects\\LauncherPAH\\data\\Microsoft.MinecraftWindowsBeta_1.21.12021.0_x64__8wekyb3d8bbwe.msixvc";
const versionNameRegex = /[^\\]*.msixvc$/;
const versionName = file.match(versionNameRegex)[0].replace(".msixvc", "");
const drive = "D";
const launcherLocation = "D:\\LauncherPAH";
const installationsLocation = launcherLocation + "\\installations";
const defaultPreviewLocation = drive + ":\\XboxGames\\Minecraft Preview for Windows\\Content\\";
function moveExecutableCommand(targetLocation: string): string {
    return `Invoke-CommandInDesktopPackage -PackageFamilyName "Microsoft.MinecraftWindowsBeta_8wekyb3d8bbwe" -app Game -Command "powershell" -Args "-Command Copy-Item '${defaultPreviewLocation}Minecraft.Windows.exe' '${installationsLocation}\\${targetLocation}'"`;
}
const removeAppxCommand = `Remove-AppxPackage -Package ${versionName}`;

async function install(_: Electron.IpcMainEvent) {
    await run(`Add-AppxPackage "${file}" -Volume ${drive}`);

    const targetLocation = installationsLocation + "\\" + versionName;
    if (!fs.existsSync(targetLocation)) fs.mkdirSync(targetLocation);
    fs.cpSync(defaultPreviewLocation, targetLocation, {
        filter(source) {
            if (source.endsWith("Minecraft.Windows.exe")) return false;
            return true;
        },
        recursive: true,
    });
    console.log(moveExecutableCommand(versionName));
    await run(moveExecutableCommand(versionName));
    await run(removeAppxCommand);
}
