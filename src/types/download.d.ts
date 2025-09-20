interface IDownloadProgressProperties {
    onProgress: (number: number) => void;
}

interface IDownloadProgressInfo {
    properties: IDownloadProgressProperties;
    url: string;
}

interface IDownloadProperties {
    directory: string;
}

interface IDownloadInfo {
    properties: IDownloadProperties;
    url: string;
}