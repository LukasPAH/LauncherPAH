import { installationsLocation } from "../../settings";
import * as fsAsync from "node:fs/promises";
import * as fs from "fs";
import * as path from "path";
import { prettifyVersionNumbers } from "./readVersions";
import { window } from "../../main";
import { sort } from "semver-ts";

const versionDB = "https://raw.githubusercontent.com/LukasPAH/minecraft-windows-gdk-version-db/refs/heads/main/historical_versions.json";

const backendVersionDB: [string[], string][] = [];

export async function getBackendVersionDB() {
    if (backendVersionDB.length === 0) await getAvailableVersions();
    return backendVersionDB;
}

export async function getLatestRelease() {
    await getBackendVersionDB();
    const releaseVersions = backendVersionDB.filter((value) => value[1].includes("Release") && !value[1].toLowerCase().includes("sideloaded"));

    const latestRelease = releaseVersions[releaseVersions.length - 1];
    const latestReleaseName = latestRelease[1];
    return latestReleaseName;
}

export async function getLatestPreview() {
    await getBackendVersionDB();
    const releaseVersions = backendVersionDB.filter((value) => value[1].includes("Preview"));

    const latestPreview = releaseVersions[releaseVersions.length - 1];
    const latestPreviewName = latestPreview[1];
    return latestPreviewName;
}

const versionsObject: IVersionUrlsAndType = {};

export async function getAvailableVersions() {
    try {
        const response = await fetch(versionDB, {
            headers: {
                Accept: "application/json",
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = (await response.json()) as IHistoricalVersionsJSON;
        const versionNamesForUI: string[] = [];

        const semverVersions: string[] = [];

        for (const previewVersions of jsonData.previewVersions) {
            const semver = previewVersions.version.replace("Preview ", "");
            const urlsAndType: IUrlsAndType = {
                urls: previewVersions.urls,
                type: "Preview",
            };
            versionsObject[semver] = urlsAndType;
            semverVersions.push(semver);
        }
        for (const releaseVersion of jsonData.releaseVersions) {
            const semver = releaseVersion.version.replace("Release ", "");
            const urlsAndType: IUrlsAndType = {
                urls: releaseVersion.urls,
                type: "Release",
            };
            versionsObject[semver] = urlsAndType;
            semverVersions.push(semver);
        }

        const sortedVersions = sort(semverVersions, { loose: true });

        for (const sortedVersion of sortedVersions) {
            const versionObject = versionsObject[sortedVersion];
            if (versionObject === undefined) {
                continue;
            }

            const { type, urls } = versionObject;
            const versionName = `${type} ${sortedVersion}`;

            versionNamesForUI.push(versionName);
            backendVersionDB.push([urls, versionName]);
        }

        const installations = await fsAsync.readdir(installationsLocation, { recursive: false });

        installations.forEach((installation) => {
            if (fs.existsSync(path.join(installationsLocation, installation, "Minecraft.Windows.exe"))) {
                const type = installation.toLowerCase().includes("minecraftwindowsbeta") ? "Preview " : "Release ";
                const isSideLoaded = installation.toLowerCase().includes("_sideloaded");
                if (!isSideLoaded) return;
                const prettyVersion = prettifyVersionNumbers(installation);
                if (prettyVersion === undefined) return;
                const prettyName = type + prettyVersion + (isSideLoaded ? " (Sideloaded)" : "");
                versionNamesForUI.push(prettyName);
                backendVersionDB.push([[], prettyName]);
            }
        });

        window?.webContents.send("availableVersions", versionNamesForUI);
    } catch (error) {
        console.error("Error fetching external JSON:", error);
    }
}
