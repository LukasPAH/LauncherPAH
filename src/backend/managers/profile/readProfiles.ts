import { setProfileVersion, removeProfileSetting, getAllProfiles, installationsLocation, getLastLaunchedProfileName, updateLastLaunchedProfileName, profilesLocation } from "../../settings";
import { getBackendVersionDB } from "../version/availableVersions";
import { BrowserWindow } from "electron";
import { uglifyVersionNumbers } from "../version/readVersions";
import * as fsAsync from "fs/promises";
import * as fs from "fs";
import path from "path";

let profiles: IProfiles = {};

export async function addProfile(name: string, versionIndex: number) {
    const profile = name.replaceAll(" ", "_");
    const versions = await getBackendVersionDB();
    const [_, versionName] = versions[versionIndex];
    profiles[profile] = {
        name: name,
        version: versionName,
    };

    const profileFolder = path.join(profilesLocation, name);
    if (!fs.existsSync(profileFolder)) await fsAsync.mkdir(profileFolder);

    setProfileVersion(profile, name, versionName);
    readProfiles();
}

export async function removeProfile(name: string) {
    const profile = name.replaceAll(" ", "_");
    delete profiles[profile];
    const profileFolder = path.join(profilesLocation, name);
    if (fs.existsSync(profileFolder)) await fsAsync.rmdir(profileFolder, { recursive: true });
    removeProfileSetting(profile);
    readProfiles();
}

export async function editProfile(name: string, index: number, beforeName: string) {
    const before = beforeName.replaceAll(" ", "_");
    const after = name.replaceAll(" ", "_");
    if (before === after) {
        const versions = await getBackendVersionDB();
        const [_, versionName] = versions[index];
        profiles[before] = {
            name: name,
            version: versionName,
        };
        readProfiles();
        return;
    }
    await removeProfile(before);
    await addProfile(after, index);
}

export function loadProfilesOnLaunch(profilesSetting: IProfiles) {
    profiles = profilesSetting;
    readProfiles();
}

export function readProfiles() {
    const lastProfile = getLastLaunchedProfileName();
    const keys = Object.keys(profiles);
    const index = keys.findIndex((key) => {
        return key === lastProfile;
    });
    const window = BrowserWindow.getAllWindows()[0];
    if (index === -1) {
        updateLastLaunchedProfileName("Default");
        const profile = getProfileFromName("Default");
        window.webContents.send("selectedProfile", profile);
    }
    window.webContents.send("createdProfiles", profiles);
}

export function getProfileFromName(name: string): IProfile | undefined {
    const profiles = getAllProfiles();
    for (const profile of Object.values(profiles)) {
        if (profile.name === name) return profile;
    }
    return;
}

export async function getVersionFolderFromName(name: string): Promise<string | undefined> {
    const profiles = getAllProfiles();
    let versionName: string | undefined = undefined;
    for (const profile of Object.values(profiles)) {
        if (profile.name === name) {
            versionName = profile.version;
            break;
        }
    }
    if (versionName === undefined) return;
    const uglyName = uglifyVersionNumbers(versionName);
    const installations = await fsAsync.readdir(installationsLocation, { recursive: false });

    for (const installation of installations) {
        if (installation.includes(uglyName)) return installation;
    }
}
