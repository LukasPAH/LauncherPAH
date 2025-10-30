export function moveExecutable(fromLocation: string, toLocation: string): string {
    const packageName = fromLocation.includes("Preview") ? "Microsoft.MinecraftWindowsBeta_8wekyb3d8bbwe" : "Microsoft.MinecraftUWP_8wekyb3d8bbwe";
    return `Invoke-CommandInDesktopPackage -PackageFamilyName "${packageName}" -app Game -Command "powershell" -Args "-Command Copy-Item '${fromLocation}\\Minecraft.Windows.exe' '${toLocation}'";`;
}
