import child_process from "child_process";
import util from "util";

export const execAsync = util.promisify(child_process.exec);

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
        const { stderr } = await execAsync(command, { shell: "bash" });
        if (stderr) return false;
        return true;
    } catch {
        return false;
    }
}
