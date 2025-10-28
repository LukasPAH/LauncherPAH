import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import { download } from "electron-dl";
import { execAsync, run } from "./powershell";
import fs from "fs";
import * as fsAsync from "fs/promises";

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
app.on("ready", async () => {
    createWindow();
    const installedVersions = await readInstalledVersions();
    console.log(installedVersions);
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
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

const launcherLocation = process.env.APPDATA + "\\LauncherPAH";

async function readInstalledVersions(): Promise<string[]> {
    const installedVersions: string[] = [];

    const installLocation = launcherLocation + "\\installations";

    const installations = await fsAsync.readdir(installLocation, { recursive: false });

    installations.forEach((installation) => {
        if (fs.existsSync(installLocation + "\\" + installation + "\\Minecraft.Windows.exe")) installedVersions.push(prettifyVersionNumbers(installation));
    });

    return installedVersions;
}

function prettifyVersionNumbers(version: string): string {
    version = version.replace("Microsoft.MinecraftUWP_", "").replace("Microsoft.MinecraftWindowsBeta_", "").replace(".0_x64__8wekyb3d8bbwe", "");
    const majorVersion = version.slice(0, -2);
    const minorVersion = version.slice(-2);
    return majorVersion + "." + minorVersion;
}

async function pickFile() {
    const window = BrowserWindow.getFocusedWindow();

    const chosenFiles = await dialog.showOpenDialog(null, { properties: ["openFile"], title: "Open Custom MSIXVC", filters: [{ extensions: ["msixvc"], name: "" }] });
    const chosenFile = chosenFiles.filePaths[0];
    if (chosenFile === undefined || chosenFile === null) return;
    if (!chosenFile.endsWith(".msixvc")) return;

    const isBeta = chosenFile.includes("MinecraftWindowsBeta");

    await install(chosenFile, window, isBeta, true);
}

function tryReadLocalData(): string | undefined {
    try {
        const contents = fs.readFileSync(process.env.APPDATA + "\\LauncherPAH\\data\\local_data.json").toString();
        return contents;
    } catch {
        if (!fs.existsSync(process.env.APPDATA + "\\LauncherPAH")) fs.mkdirSync(process.env.APPDATA + "\\LauncherPAH");
        if (!fs.existsSync(process.env.APPDATA + "\\LauncherPAH\\data")) fs.mkdirSync(process.env.APPDATA + "\\LauncherPAH\\data");
        if (!fs.existsSync(process.env.APPDATA + "\\LauncherPAH\\installations")) fs.mkdirSync(process.env.APPDATA + "\\LauncherPAH\\installations");
        return undefined;
    }
}

const defaultData: ILocalData = {
    file_version: 0,
    settings: {
        installDrive: "C",
    },
    installed_versions: [],
};

let localData: ILocalData | undefined = undefined;

const localDataString = tryReadLocalData();
if (localDataString !== undefined) {
    localData = JSON.parse(localDataString) as ILocalData;
}

if (localData === undefined) {
    localData = defaultData;
    fs.writeFileSync(process.env.APPDATA + "\\LauncherPAH\\data\\local_data.json", JSON.stringify(localData, null, 4));
}

function pushNewVersion(version: ILocalVersion) {
    for (const installedVersion of localData.installed_versions) {
        if (installedVersion.name === version.name) return;
    }
    localData.installed_versions.push(version);
    fs.writeFileSync(process.env.APPDATA + "\\LauncherPAH\\data\\local_data.json", JSON.stringify(localData, null, 4));
}

function isVersionInstalled(name: string): boolean {
    for (const installedVersion of localData.installed_versions) {
        if (installedVersion.name.endsWith(name)) return true;
    }
    return false;
}

const drive = localData.settings.installDrive;
const installationsLocation = launcherLocation + "\\installations";
const defaultPreviewLocation = drive + ":\\XboxGames\\Minecraft Preview for Windows\\Content\\";
const defaultReleaseLocation = drive + ":\\XboxGames\\Minecraft for Windows\\Content\\";
const releasePackageName = "Microsoft.MinecraftUWP";
const previewPackageName = "Microsoft.MinecraftWindowsBeta";

function moveExecutable(targetLocation: string, previewLocation: string): string {
    const packageName = previewLocation.includes("Preview") ? "Microsoft.MinecraftWindowsBeta_8wekyb3d8bbwe" : "Microsoft.MinecraftUWP_8wekyb3d8bbwe";
    return `Invoke-CommandInDesktopPackage -PackageFamilyName "${packageName}" -app Game -Command "powershell" -Args "-Command Copy-Item '${previewLocation}Minecraft.Windows.exe' '${installationsLocation}\\${targetLocation}'";`;
}

async function mainDownload(_: Electron.IpcMainEvent, info: IDownloadProgressInfo) {
    const window = BrowserWindow.getFocusedWindow();
    window.webContents.send("startDownload", true);
    let filePath: string | undefined = undefined;

    const versionNameRegex = /[^/]*.msixvc$/;
    const versionName = info.url.match(versionNameRegex)[0].replace(".msixvc", "");

    if (isVersionInstalled(versionName)) {
        window.webContents.send("progressStage", "register");
        await run(`wdapp register "${installationsLocation}\\${versionName}"`);
        await execAsync("start minecraft-preview://");
        window.webContents.send("progressStage", "idle");
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

async function registerDev(file: string, previewLocation: string) {
    try {
        await run(`wdapp install /drive=${drive} "${file}"`);
    } catch (e) {
        console.log(e);
    }
    // Sometimes registration fails for whatever reason. Just keep retrying until it succeeds.
    await register(file, previewLocation);
}

async function register(file: string, previewLocation: string) {
    console.log(file);
    await run(`Add-AppxPackage "${file}" -Volume '${drive}:\\XboxGames'`);
    // Sometimes registration fails for whatever reason. Just keep retrying until it succeeds.
    if (!fs.existsSync(previewLocation)) await register(file, previewLocation);
}

async function install(file: string, window: Electron.BrowserWindow, isBeta: boolean, sideloaded = false) {
    console.log(sideloaded);
    const versionNameRegex = /[^\\]*.msixvc$/;
    const versionName = file.match(versionNameRegex)[0].replace(".msixvc", "");
    const removeAppxCommand = `Remove-AppxPackage -Package ${versionName}`;

    const defaultLocation = isBeta ? defaultPreviewLocation : defaultReleaseLocation;

    try {
        const command = `$name = (Get-AppxPackage -Name "${isBeta ? previewPackageName : releasePackageName}").PackageFullName; wdapp unregister $name;`;
        await run(command);
    } catch (e) {
        console.log(e);
    }

    if (sideloaded) await registerDev(file, defaultLocation);
    else await register(file, defaultLocation);

    window.webContents.send("progressStage", "copy");

    const targetLocation = installationsLocation + "\\" + versionName;
    if (!fs.existsSync(targetLocation)) fs.mkdirSync(targetLocation);

    await fsAsync.cp(defaultLocation, targetLocation, {
        recursive: true,
        filter(source) {
            if (source.endsWith(".exe")) return false;
            return true;
        },
    });

    await run(moveExecutable(versionName, defaultLocation));
    window.webContents.send("progressStage", "unregister");
    await run(removeAppxCommand);
    window.webContents.send("progressStage", "cleanup");
    if (!sideloaded) await fsAsync.rm(file);
    pushNewVersion({ name: versionName, path: targetLocation });
    window.webContents.send("progressStage", "register");
    await run(`wdapp register "${targetLocation}"`);
    window.webContents.send("progressStage", "idle");
    if (isBeta) await execAsync("start minecraft-preview://");
    else await execAsync("start minecraft://");
}
