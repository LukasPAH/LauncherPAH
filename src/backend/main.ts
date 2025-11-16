import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import { readInstalledVersions } from "./managers/version/readVersions";
import { downloadVersion } from "./events/responses/downloadVersion";
import { getAvailableVersions } from "./managers/version/availableVersions";
import { pickFile } from "./events/responses/pickFile";
import { launchVersion } from "./events/responses/launchVersion";
import { setSelectedProfile, setSelectedProfileOnStart } from "./events/responses/setSelectedVersion";
import { getLastLaunchedProfileName, updateDefaultProfileVersionsOnLaunch } from "./settings";
import { removeVersion } from "./events/responses/removeVersion";
import { openFolder, openProfile } from "./events/responses/openFolder";
import { addProfileEventResponse, removeProfileEventResponse } from "./events/responses/profile";
import { tryMigrageGDKUserData } from "./managers/profile/profileFolder";
import { getProfileFromName } from "./managers/profile/readProfiles";

let window: BrowserWindow | null = null;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
    app.quit();
}

const createWindow = async () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        minHeight: 600,
        minWidth: 800,
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

// Ensure there is only ever one instance of the application loaded.
// If the user tries to launch another instance of the app, close
// the second instance immediately and re-focus the first instance.
if (!app.requestSingleInstanceLock()) {
    app.quit();
} else {
    app.on("second-instance", () => {
        if (window === null) return;
        if (window.isMinimized()) window.restore();
        window.focus();
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
    if (window === null) window = await createWindow();
    ipcMain.on("UILoaded", async () => {
        await readInstalledVersions();
        await getAvailableVersions();
        await updateDefaultProfileVersionsOnLaunch();
        const lastLaunchedProfileName = getLastLaunchedProfileName();
        let profile = getProfileFromName(lastLaunchedProfileName);
        if (profile === undefined) {
            profile = getProfileFromName("Default");
        }
        await setSelectedProfileOnStart(profile);
    });
    ipcMain.on("launchVersion", () => {
        const lastLaunchedProfileName = getLastLaunchedProfileName();
        const lastLaunchedProfile = getProfileFromName(lastLaunchedProfileName);

        launchVersion(lastLaunchedProfile);
    });
    ipcMain.on("download", (_, index: number) => {
        const lastLaunchedProfileName = getLastLaunchedProfileName();
        const lastLaunchedProfile = getProfileFromName(lastLaunchedProfileName);
        downloadVersion(index, lastLaunchedProfile);
    });
    ipcMain.on("filePick", pickFile);
    ipcMain.on("setSelectedProfile", (_, profile: IProfile) => {
        setSelectedProfile(profile);
    });
    ipcMain.on("removeVersion", async (_, index: number) => {
        await removeVersion(index);
    });
    ipcMain.on("openInstallLocation", async (_, index: number) => {
        await openFolder(index);
    });
    ipcMain.on("addProfile", async (_, data) => {
        await addProfileEventResponse(data.name, data.index, data.beforeName);
    });
    ipcMain.on("removeProfile", (_, name) => {
        removeProfileEventResponse(name);
    });
    ipcMain.on("openProfileLocation", (_, profile: IProfile) => {
        openProfile(profile);
    });
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
