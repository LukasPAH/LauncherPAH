type Drive = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z";

interface ISettings {
    installDrive: Drive;
    lastLaunchedProfile: string;
    profiles: IProfiles;
    dockerFolder?: string;
}

interface ILocalData {
    file_version: number;
    settings: ISettings;
}

interface IProfiles {
    [key: string]: IProfile;
}

interface IProfile {
    name: string;
    version: string;
}