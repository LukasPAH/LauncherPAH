import { execAsync } from "./powershell";
import fs from "fs";

export async function isPreviewRunning(): Promise<boolean> {
    const response = await execAsync("(Get-Process -Name Minecraft.Windows).Path", { shell: "powershell" });
    if (response.stderr) return false;
    const stdout = response.stdout.replace(/\s+/g, "");
    if (response.stdout) {
        try {
            if (fs.existsSync(stdout) && stdout.toLowerCase().includes("beta") && stdout.toLowerCase().includes("minecraft")) return true;
        } catch {
            return false;
        }
    }
    return false;
}

export async function isReleaseRunning(): Promise<boolean> {
    const response = await execAsync("(Get-Process -Name Minecraft.Windows).Path", { shell: "powershell" });
    if (response.stderr) return false;
    const stdout = response.stdout.replace(/\s+/g, "");
    if (response.stdout) {
        try {
            if (fs.existsSync(stdout) && !stdout.toLowerCase().includes("beta") && stdout.toLowerCase().includes("minecraft")) return true;
        } catch {
            return false;
        }
    }
    return false;
}
