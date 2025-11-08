import fs from "fs";
import { getLatestRelease, getLatestPreview } from "./managers/version/availableVersions";
import { loadProfilesOnLaunch } from "./managers/profile/readProfiles";

const data = loadLocalData();
export const launcherLocation = process.env.APPDATA + "\\LauncherPAH";
export const installationsLocation = launcherLocation + "\\installations";
let drive = data.settings.installDrive;
let defaultPreviewLocation = drive + ":\\XboxGames\\Minecraft Preview for Windows\\Content";
let defaultReleaseLocation = drive + ":\\XboxGames\\Minecraft for Windows\\Content";
export const releasePackageName = "Microsoft.MinecraftUWP";
export const previewPackageName = "Microsoft.MinecraftWindowsBeta";

const defaultData: ILocalData = {
    file_version: 0,
    settings: {
        installDrive: "C",
        lastLaunchedVersion: false,
        profiles: {
            default: {
                name: "Default",
                version: "",
            },
            defaultPreview: {
                name: "Preview",
                version: "",
            },
        },
    },
};

function loadLocalData(): ILocalData {
    let localData: ILocalData | undefined = undefined;
    const localDataString = tryReadLocalData();
    if (localDataString !== undefined) {
        localData = JSON.parse(localDataString) as ILocalData;
        // Parse and set defaults.
        let fileNeedsUpdate = false;
        if (localData.settings.installDrive === undefined) {
            localData.settings.installDrive = "C";
            fileNeedsUpdate = true;
        }
        if (localData.settings.lastLaunchedVersion === undefined) {
            localData.settings.lastLaunchedVersion = false;
            fileNeedsUpdate = true;
        }
        if (localData.settings.profiles === undefined) {
            localData.settings.profiles = {};
            fileNeedsUpdate = true;
        }
        if (typeof localData.settings.profiles.default !== "object") {
            localData.settings.profiles.default = {
                name: "Default",
                version: "",
            };
            fileNeedsUpdate = true;
        }
        if (typeof localData.settings.profiles.defaultPreview !== "object") {
            localData.settings.profiles.defaultPreview = {
                name: "Preview",
                version: "",
            };
            fileNeedsUpdate = true;
        }
        if (fileNeedsUpdate) {
            writeLocalData(localData);
        }
    }

    if (localData === undefined) {
        localData = defaultData;
        writeLocalData(localData);
    }

    return localData;
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

function writeLocalData(localData: ILocalData) {
    fs.writeFileSync(process.env.APPDATA + "\\LauncherPAH\\data\\local_data.json", JSON.stringify(localData, null, 4));
}

export function updateLastLaunchedVersion(version: string) {
    data.settings.lastLaunchedVersion = version;
    writeLocalData(data);
}

export function updateInstallDrive(driveLetter: Drive) {
    data.settings.installDrive = drive;
    drive = driveLetter;
    defaultPreviewLocation = drive + ":\\XboxGames\\Minecraft Preview for Windows\\Content";
    defaultReleaseLocation = drive + ":\\XboxGames\\Minecraft for Windows\\Content";
    writeLocalData(data);
}

export function getDrive() {
    return drive;
}

export function getReleaseLocation() {
    return defaultReleaseLocation;
}

export function getDefaultPreviewLocation() {
    return defaultPreviewLocation;
}

export function getLastLaunchedVersion() {
    return data.settings.lastLaunchedVersion;
}

export async function getDefaultProfileVersion() {
    const defaultProfile = data.settings.profiles.default;
    if (defaultProfile.name === undefined || defaultProfile.version === undefined || defaultProfile.version === "") {
        data.settings.profiles.default.name = "Default";
        data.settings.profiles.default.version = await getLatestRelease();
        data.settings.profiles.default = defaultProfile;
    }
    writeLocalData(data);
    return defaultProfile;
}

export async function getDefaultPreviewProfileVersion() {
    const defaultPreviewProfile = data.settings.profiles.defaultPreview;
    if (defaultPreviewProfile.name === undefined || defaultPreviewProfile.version === undefined || defaultPreviewProfile.version === "") {
        data.settings.profiles.defaultPreview.name = "Preview";
        data.settings.profiles.defaultPreview.version = await getLatestPreview();
        data.settings.profiles.defaultPreview = defaultPreviewProfile;
    }
    writeLocalData(data);
    return defaultPreviewProfile;
}

export async function updateDefaultProfileVersionsOnLaunch() {
    data.settings.profiles.default = await getDefaultProfileVersion();
    data.settings.profiles.defaultPreview = await getDefaultPreviewProfileVersion();
    loadProfilesOnLaunch(data.settings.profiles);
    writeLocalData(data);
}

export async function getProfileVersion(profile: string) {
    return data.settings.profiles[profile];
}

export function setProfileVersion(profile: string, name: string, version: string) {
    data.settings.profiles[profile].name = name;
    data.settings.profiles[profile].version = version;
    writeLocalData(data);
}

export function removeProfileSetting(profile: string) {
    delete data.settings.profiles[profile];
    writeLocalData(data);
}
