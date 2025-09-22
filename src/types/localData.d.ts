type Drive = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z";

interface ISettings {
    installDrive: Drive;
}

interface ILocalVersion {
    name: string;
    path: string;
}

interface ILocalData {
    file_version: number;
    settings: ISettings;
    installed_versions: ILocalVersion[];
}
