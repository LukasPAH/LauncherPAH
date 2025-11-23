import * as child_process from "child_process";
import * as path from "path";
import * as fs from "fs";
import { fileAssociations } from "../../../../fileAssociations";
import { BrowserWindow } from "electron";
import { getVersionFolderFromName } from "../../managers/profile/readProfiles";
import { installationsLocation } from "../../settings";

let fileToLaunch = "";

export async function handleAssociations(filePathLocation: string | string[]) {
    const window = BrowserWindow.getAllWindows()[0];
    let filePath = "";
    if (typeof filePathLocation === "string") filePath = filePathLocation;
    else {
        for (const association of fileAssociations) {
            const findResult = filePathLocation.find((arg) => arg.endsWith("." + association));
            if (findResult === undefined) continue;
            filePath = findResult;
            break;
        }
    }
    if (filePath === "") return;
    fileToLaunch = filePath;
    window.webContents.send("launchedFile", path.basename(filePath));
}

export function getLaunchedFile(args: string[]) {
    let filePath = "";
    for (const association of fileAssociations) {
        const findResult = args.find((arg) => arg.endsWith("." + association));
        if (findResult === undefined) continue;
        filePath = findResult;
        break;
    }
    if (filePath === "") return undefined;
    return filePath;
}

export async function launchFile(profile: IProfile) {
    if (fileToLaunch === "") return;
    const folder = await getVersionFolderFromName(profile.name);
    const executableLocation = path.join(installationsLocation, folder, "Minecraft.Windows.exe");
    let protocol = "minecraft";
    if (profile.version.includes("Preview")) protocol = "minecraft-preview";
    if (fileToLaunch.endsWith(".mcproject") || fileToLaunch.endsWith(".mceditoraddon")) {
        importProject(executableLocation, fileToLaunch, protocol as "minecraft" | "minecraft-preview");
    } else {
        importContent(executableLocation, fileToLaunch);
    }
}

export function importProject(exeFilePath: string, importFilePath: string, previewOrReleaseProtocol: "minecraft" | "minecraft-preview") {
    const directory = path.dirname(exeFilePath);
    const executable = path.basename(exeFilePath);
    const launchCommand = `cd "${directory}"; ./${executable} ${previewOrReleaseProtocol}://creator/?Editor=true"&"import="${importFilePath}";`;
    if (fs.existsSync(exeFilePath)) {
        child_process.spawn(launchCommand, { stdio: "ignore", shell: "powershell" });
    }
}

export function importContent(exeFilePath: string, importFilePath: string) {
    const directory = path.dirname(exeFilePath);
    const executable = path.basename(exeFilePath);
    const launchCommand = `cd "${directory}"; ./${executable} "${importFilePath}";`;
    if (fs.existsSync(exeFilePath)) {
        child_process.spawn(launchCommand, { stdio: "ignore", shell: "powershell" });
    }
}
