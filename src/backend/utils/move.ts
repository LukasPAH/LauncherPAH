import * as fsAsync from "fs/promises";
import { fixMinecraftTenFontMetadata } from "../utils/fixFonts";

export function moveExecutable(fromLocation: string, toLocation: string): string {
    const packageName = fromLocation.includes("Preview") ? "Microsoft.MinecraftWindowsBeta_8wekyb3d8bbwe" : "Microsoft.MinecraftUWP_8wekyb3d8bbwe";
    return `Invoke-CommandInDesktopPackage -PackageFamilyName "${packageName}" -app Game -Command "powershell" -Args "-Command Copy-Item '${fromLocation}\\Minecraft.Windows.exe' '${toLocation}'";`;
}

export async function moveFontMetadataFile(fromPath: string, toPath: string) {
    const remainingFiles = await fsAsync.readdir(fromPath, { recursive: true, withFileTypes: true });
    for (const remainingFile of remainingFiles) {
        if (remainingFile.name !== "font_metadata.json") continue;

        const path = remainingFile.parentPath + "\\" + remainingFile.name;
        const localPath = remainingFile.parentPath.replace(fromPath, "");
        const outputPath = toPath + localPath + "\\" + remainingFile.name;
        await fixMinecraftTenFontMetadata(path);
        await fsAsync.cp(path, outputPath, { recursive: true });
        await fsAsync.rm(path);
    }
}
