import { setProfileVersion, removeProfileSetting, GDKPreviewUsersFolder, GDKReleaseUsersFolder, getAllProfiles, installationsLocation } from "../../settings";
import { getBackendVersionDB } from "../version/availableVersions";
import { BrowserWindow } from "electron";
import { uglifyVersionNumbers } from "../version/readVersions";
import * as fsAsync from "fs/promises";

let profiles: IProfiles = {};

export async function addProfile(name: string, versionIndex: number) {
    const profile = name.replaceAll(" ", "_");
    const versions = await getBackendVersionDB();
    const [_, versionName] = versions[versionIndex];
    profiles[profile] = {
        name: name,
        version: versionName,
    };

    if (versionName.includes("Preview")) {
        console.log(GDKPreviewUsersFolder);
    }
    if (!versionName.includes("Preview")) {
        console.log(GDKReleaseUsersFolder);
    }

    setProfileVersion(profile, name, versionName);
    readProfiles();
}

export function removeProfile(name: string) {
    const profile = name.replaceAll(" ", "_");
    delete profiles[profile];
    removeProfileSetting(profile);
    readProfiles();
}

export function loadProfilesOnLaunch(profilesSetting: IProfiles) {
    profiles = profilesSetting;
    readProfiles();
}

export function readProfiles() {
    const window = BrowserWindow.getAllWindows()[0];
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
