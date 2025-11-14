import fs from "fs";
import { getLatestRelease, getLatestPreview } from "./managers/version/availableVersions";
import { loadProfilesOnLaunch } from "./managers/profile/readProfiles";
import path from "path";

const data = loadLocalData();
export const launcherLocation = process.env.APPDATA + "\\LauncherPAH";
export const installationsLocation = launcherLocation + "\\installations";
export const profilesLocation = launcherLocation + "\\profiles";
let drive = data.settings.installDrive;
let defaultPreviewLocation = drive + ":\\XboxGames\\Minecraft Preview for Windows\\Content";
let defaultReleaseLocation = drive + ":\\XboxGames\\Minecraft for Windows\\Content";
export const releasePackageName = "Microsoft.MinecraftUWP";
export const previewPackageName = "Microsoft.MinecraftWindowsBeta";
export const GDKReleaseUsersFolder = path.join(process.env.APPDATA, "Minecraft Bedrock", "Users");
export const GDKPreviewUsersFolder = path.join(process.env.APPDATA, "Minecraft Bedrock Preview", "Users");

const defaultData: ILocalData = {
    file_version: 0,
    settings: {
        installDrive: "C",
        lastLaunchedProfile: "Default",
        profiles: {
            Default: {
                name: "Default",
                version: "",
            },
            Preview: {
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
        if (localData.settings.lastLaunchedProfile === undefined) {
            localData.settings.lastLaunchedProfile = "Default";
            fileNeedsUpdate = true;
        }
        if (localData.settings.profiles === undefined) {
            localData.settings.profiles = {};
            fileNeedsUpdate = true;
        }
        if (typeof localData.settings.profiles.Default !== "object") {
            localData.settings.profiles.Default = {
                name: "Default",
                version: "",
            };
            fileNeedsUpdate = true;
        }
        if (typeof localData.settings.profiles.Preview !== "object") {
            localData.settings.profiles.Preview = {
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
    if (!fs.existsSync(process.env.APPDATA + "\\LauncherPAH\\profiles")) fs.mkdirSync(process.env.APPDATA + "\\LauncherPAH\\profiles");
    if (!fs.existsSync(process.env.APPDATA + "\\LauncherPAH\\installations")) fs.mkdirSync(process.env.APPDATA + "\\LauncherPAH\\installations");
    try {
        const contents = fs.readFileSync(process.env.APPDATA + "\\LauncherPAH\\data\\local_data.json").toString();
        return contents;
    } catch {
        if (!fs.existsSync(process.env.APPDATA + "\\LauncherPAH")) fs.mkdirSync(process.env.APPDATA + "\\LauncherPAH");
        if (!fs.existsSync(process.env.APPDATA + "\\LauncherPAH\\data")) fs.mkdirSync(process.env.APPDATA + "\\LauncherPAH\\data");
        return undefined;
    }
}

function writeLocalData(localData: ILocalData) {
    fs.writeFileSync(process.env.APPDATA + "\\LauncherPAH\\data\\local_data.json", JSON.stringify(localData, null, 4));
}

export function updateLastLaunchedProfileName(profileName: string) {
    data.settings.lastLaunchedProfile = profileName;
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

export function getLastLaunchedProfileName() {
    return data.settings.lastLaunchedProfile;
}

export async function getDefaultProfileVersion() {
    const defaultProfile = data.settings.profiles.Default;
    if (defaultProfile.name === undefined || defaultProfile.version === undefined || defaultProfile.version === "") {
        data.settings.profiles.Default.name = "Default";
        data.settings.profiles.Default.version = await getLatestRelease();
        data.settings.profiles.Default = defaultProfile;
    }
    writeLocalData(data);
    return defaultProfile;
}

export async function getDefaultPreviewProfileVersion() {
    const defaultPreviewProfile = data.settings.profiles.Preview;
    if (defaultPreviewProfile.name === undefined || defaultPreviewProfile.version === undefined || defaultPreviewProfile.version === "") {
        data.settings.profiles.Preview.name = "Preview";
        data.settings.profiles.Preview.version = await getLatestPreview();
        data.settings.profiles.Preview = defaultPreviewProfile;
    }
    writeLocalData(data);
    return defaultPreviewProfile;
}

export async function updateDefaultProfileVersionsOnLaunch() {
    data.settings.profiles.Default = {} as IProfile;
    data.settings.profiles.Default = await getDefaultProfileVersion();
    data.settings.profiles.Preview = {} as IProfile;
    data.settings.profiles.Preview = await getDefaultPreviewProfileVersion();
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

export function getAllProfiles() {
    return data.settings.profiles;
}
