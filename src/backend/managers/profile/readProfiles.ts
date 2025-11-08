import { setProfileVersion, removeProfileSetting } from "../../settings";
import { getBackendVersionDB } from "../version/availableVersions";
import { BrowserWindow } from "electron";

let profiles: IProfiles = {};

export async function addProfile(name: string, versionIndex: number) {
    const profile = name.replaceAll(" ", "_");
    const versions = await getBackendVersionDB();
    const [_, versionName] = versions[versionIndex];
    profiles[profile] = {
        name: name,
        version: versionName,
    };
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
