interface IHistoricalVersionsJSON {
    file_version: number;
    previewVersions: IVersion[];
    releaseVersions: IVersion[];
}

interface IVersion {
    version: string;
    urls: string[];
}

interface IVersionUrlsAndType {
    [key: string]: IUrlsAndType | undefined;
}

interface IUrlsAndType {
    urls: string[];
    type: "Release" | "Preview";
}
