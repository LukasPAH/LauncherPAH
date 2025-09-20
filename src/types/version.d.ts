interface IHistoricalVersionsJSON {
    file_version: number;
    versions: IVersion[];
}

interface IVersion {
    version: string;
    url: string;
}
