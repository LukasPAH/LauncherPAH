import * as fsAsync from "fs/promises";
import * as settings from "../../settings";
import path from "path";
import { existsSync } from "fs";
import { download, File } from "electron-dl";
import { BrowserWindow } from "electron";
import * as tar from "tar";

export async function installProton(profile: IProfile): Promise<IProtonOptions> {
    const protonFileLocation = path.join(settings.launcherLocation, "data", "proton_versions.json");
    const protonFile = (await fsAsync.readFile(protonFileLocation)).toString();
    const protonVersions = JSON.parse(protonFile) as IAvailableProtonVersion[];

    if (profile.protonOptions) {
        const protonPath = path.join(settings.protonLocation, profile.protonOptions.protonGDKVersion);
        if (existsSync(protonPath)) {
            return profile.protonOptions;
        }
        await downloadProton(protonVersions, profile.protonOptions, protonPath);
        return profile.protonOptions;
    }

    const latestProtonRelease = protonVersions[0];
    const protonPath = path.join(settings.protonLocation, latestProtonRelease.name);
    const defaultProtonOptions: IProtonOptions = {
        enableWayland: false,
        enableHDR: false,
        enableLogging: false,
        protonGDKVersion: latestProtonRelease.name,
    };
    settings.setProtonOptions(profile, defaultProtonOptions);

    if (!existsSync(protonPath)) {
        await downloadProton(protonVersions, defaultProtonOptions, protonPath);
    }

    return defaultProtonOptions;
}

async function downloadProton(versions: IAvailableProtonVersion[], protonOptions: IProtonOptions, path: string) {
    const window = BrowserWindow.getAllWindows()[0];
    const version = versions.find((version) => {
        return version.name === protonOptions.protonGDKVersion;
    });
    const url = version !== undefined ? version.url : versions[0].url;
    const promises: Promise<void>[] = [];
    await download(window, url, {
        directory: path,
        onProgress(progress) {
            window.webContents.send("downloadProgress", progress, "Proton");
        },
        onCompleted(file) {
            window.webContents.send("downloadCompleted", "Proton");
            window.webContents.send("progressStage", "Unpacking proton...");
            promises.push(unpackProton(file, path));
        },
    });
    await Promise.all(promises);
    window.webContents.send("progressStage", "idle");
}

async function unpackProton(tarFile: File, path: string) {
    await tar.extract({
        file: tarFile.path,
        cwd: path,
        onReadEntry(entry) {
            entry.path = entry.path.replace(/^[^/]+\//, "");
        },
    });
    await fsAsync.rm(tarFile.path);
}
