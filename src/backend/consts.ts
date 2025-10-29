import fs from "fs";

export const localData = loadLocalData();
export const launcherLocation = process.env.APPDATA + "\\LauncherPAH";
export const drive = localData.settings.installDrive;
export const installationsLocation = launcherLocation + "\\installations";
export const defaultPreviewLocation = drive + ":\\XboxGames\\Minecraft Preview for Windows\\Content";
export const defaultReleaseLocation = drive + ":\\XboxGames\\Minecraft for Windows\\Content";
export const releasePackageName = "Microsoft.MinecraftUWP";
export const previewPackageName = "Microsoft.MinecraftWindowsBeta";

const defaultData: ILocalData = {
    file_version: 0,
    settings: {
        installDrive: "C",
    },
    installed_versions: [],
};

function loadLocalData(): ILocalData {
    let localData: ILocalData | undefined = undefined;
    const localDataString = tryReadLocalData();
    if (localDataString !== undefined) {
        localData = JSON.parse(localDataString) as ILocalData;
    }

    if (localData === undefined) {
        localData = defaultData;
        fs.writeFileSync(process.env.APPDATA + "\\LauncherPAH\\data\\local_data.json", JSON.stringify(localData, null, 4));
    }

    return localData;
}

function tryReadLocalData(): string | undefined {
    try {
        const contents = fs.readFileSync(process.env.APPDATA + "\\LauncherPAH\\data\\local_data.json").toString();
        return contents;
    } catch {
        if (!fs.existsSync(process.env.APPDATA + "\\LauncherPAH")) fs.mkdirSync(process.env.APPDATA + "\\LauncherPAH");
        if (!fs.existsSync(process.env.APPDATA + "\\LauncherPAH\\data")) fs.mkdirSync(process.env.APPDATA + "\\LauncherPAH\\data");
        if (!fs.existsSync(process.env.APPDATA + "\\LauncherPAH\\installations")) fs.mkdirSync(process.env.APPDATA + "\\LauncherPAH\\installations");
        return undefined;
    }
}
