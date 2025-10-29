import { cp, rm } from "fs/promises";

export async function moveData(sourceDir: string, destinationDir: string) {
    try {
        // Copy the source folder to the destination
        await cp(sourceDir, destinationDir, {
            recursive: true,
            filter(source) {
                if (source.endsWith(".exe")) return false;
                return true;
            },
        });
        console.log(`Folder copied from '${sourceDir}' to '${destinationDir}' successfully.`);

        // Remove the original source folder
        await rm(sourceDir, { recursive: true, force: true });
        console.log(`Original folder '${sourceDir}' removed successfully.`);
    } catch (error) {
        console.error(`Error moving folder: ${error}`);
    }
}

export function moveExecutable(fromLocation: string, toLocation: string): string {
    const packageName = fromLocation.includes("Preview") ? "Microsoft.MinecraftWindowsBeta_8wekyb3d8bbwe" : "Microsoft.MinecraftUWP_8wekyb3d8bbwe";
    return `Invoke-CommandInDesktopPackage -PackageFamilyName "${packageName}" -app Game -Command "powershell" -Args "-Command Copy-Item '${fromLocation}\\Minecraft.Windows.exe' '${toLocation}'";`;
}
