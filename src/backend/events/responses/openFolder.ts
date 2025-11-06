import { shell } from "electron";
import { getInstalledVersions } from "../../managers/version/readVersions";
import { installationsLocation } from "../../consts";

export async function openFolder(index: number) {
    const versions = getInstalledVersions();
    const version = versions[index];
    shell.openPath(installationsLocation + "\\" + version);
}
