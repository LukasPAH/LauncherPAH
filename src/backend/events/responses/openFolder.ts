import { shell } from "electron";
import { getInstalledVersions } from "../../managers/version/readVersions";
import { installationsLocation, profilesLocation } from "../../settings";
import * as path from "path"

export async function openFolder(index: number) {
    const versions = getInstalledVersions();
    const version = versions[index];
    shell.openPath(installationsLocation + "\\" + version);
}

export function openProfile(profile: IProfile) {
    const name = profile.name;
    shell.openPath(path.join(profilesLocation, name));
}
