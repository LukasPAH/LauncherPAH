"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const node_path_1 = __importDefault(require("node:path"));
const electron_squirrel_startup_1 = __importDefault(require("electron-squirrel-startup"));
const electron_dl_1 = require("electron-dl");
const child_process_1 = __importDefault(require("child_process"));
const powershell_1 = require("./powershell");
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (electron_squirrel_startup_1.default) {
    electron_1.app.quit();
}
const createWindow = () => {
    // Create the browser window.
    const mainWindow = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: node_path_1.default.join(__dirname, "preload.js"),
            defaultFontFamily: {
                standard: "Roboto",
            },
        },
    });
    mainWindow.setBackgroundColor("#212322");
    // and load the index.html of the app.
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    }
    else {
        mainWindow.loadFile(node_path_1.default.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
    }
    // Center the window.
    mainWindow.center();
};
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron_1.app.on("ready", () => {
    createWindow();
    electron_1.ipcMain.on("download", mainDownload);
    electron_1.ipcMain.on("install", install);
});
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
electron_1.app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
async function mainDownload(_, info) {
    const window = electron_1.BrowserWindow.getFocusedWindow();
    window.webContents.send("startDownload", true);
    await (0, electron_dl_1.download)(window, info.url, {
        directory: process.cwd() + "/data",
        onProgress(progress) {
            window.webContents.send("downloadProgress", progress);
        },
        onCompleted(_) {
            window.webContents.send("downloadCompleted", undefined);
        },
    });
    const code = await (0, powershell_1.run)("powershell", ["-executionpolicy", "unrestricted", "-file", "cwd"]);
    process.exit(code);
}
function install(_) {
    const ps = child_process_1.default.spawn("powershell.exe", ["-Command", "wdapp"]);
    ps.stdout.on("data", (data) => {
        console.log(`PowerShell Output: ${data}`);
    });
    ps.stderr.on("data", (data) => {
        console.error(`PowerShell Error: ${data}`);
    });
    ps.on("close", (code) => {
        console.log(`PowerShell process exited with code ${code}`);
    });
}
//# sourceMappingURL=main.js.map