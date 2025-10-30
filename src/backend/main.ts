import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import { readInstalledVersions } from "./managers/version/readVersions";
import { downloadVersion } from "./events/responses/downloadVersion";
import { getAvailableVersions } from "./managers/version/getAvailableVersions";
import { pickFile } from "./events/responses/pickFile";

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
    ipcMain.on("UILoaded", async () => {
        await readInstalledVersions();
        await getAvailableVersions();
    });
    ipcMain.on("download", downloadVersion);
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
