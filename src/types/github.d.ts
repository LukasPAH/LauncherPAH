interface IGitHubReleaseJSONResponse {
    assets: IGitHubReleaseAssets[];
}

interface IGitHubReleaseAssets {
    content_type: string;
    name: string;
    browser_download_url: string;
    uploader: IGitHubUploader;
}

interface IGitHubUploader {
    login: string;
}
