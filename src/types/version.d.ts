interface IHistoricalVersionsJSON {
    file_version: number;
    previewVersions: IVersion[],
    releaseVersions: IVersion[]
}

interface IVersion {
    version: string;
    urls: string[];
}
