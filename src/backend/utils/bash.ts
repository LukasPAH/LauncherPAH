import child_process from "child_process";
import util from "util";

export const execAsync = util.promisify(child_process.exec);

export async function umuFlatpakRun(binaryLocation: string, environmentVariables: Record<string, string>, args: string[]) {
    const environmentVariableStrings: string[] = [];
    for (const [key, value] of Object.entries(environmentVariables)) {
        environmentVariableStrings.push(`--env=${key}=${value.replace(/^'|'$/g, "")}`);
    }
    child_process.spawn("flatpak-spawn", ["--host", ...environmentVariableStrings, binaryLocation, ...args]);
}

export async function spawnDetached(command: string) {
    const child = child_process.spawn(command, { shell: "bash", detached: true, stdio: "ignore" });
    child.unref();
}

export async function run(command: string, supressStdErr?: boolean): Promise<string> {
    try {
        const { stderr, stdout } = await execAsync(command, { shell: "bash" });
        if (stderr && supressStdErr !== true) return `Error: ${stderr}`;
        return stdout;
    } catch (error) {
        return `Error: ${error}`;
    }
}

export async function tryRun(command: string) {
    try {
        const { stderr, stdout } = await execAsync(command, { shell: "bash" });
        console.log(stdout);
        if (stderr) {
            console.log(stderr);
            return false;
        }
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}
