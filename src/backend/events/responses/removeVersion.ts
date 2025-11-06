import { getInstalledVersions, removeInstalledVersion } from "../../managers/version/readVersions";

export async function removeVersion(index: number) {
    const versions = getInstalledVersions();
    const version = versions[index];
    await removeInstalledVersion(version)
}
