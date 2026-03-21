import * as fsAsync from "fs/promises";
import * as settings from "../../settings";
import path from "path";

const protonSources: IProtonSourceDetails[] = [
    {
        author: "Weather-OS",
        repo: "GDK-Proton",
    },
    {
        author: "LukasPAH",
        repo: "GDK-Proton-Custom",
    },
];

export async function getProtonVersions() {
    const promises: Promise<Response>[] = [];
    for (const { author, repo } of protonSources) {
        const url = `https://api.github.com/repos/${author}/${repo}/releases`;
        const promise = fetch(url, {
            headers: {
                Accept: "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
            },
        });
        promises.push(promise);
    }
    const responses = await Promise.all(promises);
    const protonVersions = [];
    for (const response of responses) {
        if (!response.ok) continue;
        const releases = (await response.json()) as IGitHubReleaseJSONResponse[];
        for (const release of releases) {
            for (const asset of release.assets) {
                if (asset.content_type !== "application/gzip") continue;

                // Workaround for initial release since it was named wrong.
                let assetName = asset.name !== "GE-Proton10-25.tar.gz" ? asset.name : "GDK-Proton10-25.tar.gz";
                assetName = assetName.replace(".tar.gz", "");

                const version: IAvailableProtonVersion = {
                    author: asset.uploader.login,
                    name: assetName,
                    url: asset.browser_download_url,
                };
                protonVersions.push(version);
            }
        }
    }
    protonVersions.sort((a, b) => {
        return b.name.localeCompare(a.name);
    });
    const stringifiedJSON = JSON.stringify(protonVersions, null, 4);
    const filePath = path.join(settings.launcherLocation, "data", "proton_versions.json");
    await fsAsync.writeFile(filePath, stringifiedJSON);
}
