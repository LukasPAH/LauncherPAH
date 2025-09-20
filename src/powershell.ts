import { spawn } from "child_process";

export async function run(executable: string, args: string[], opts = {}): Promise<number> {
    return new Promise((resolve, reject) => {
        const child = spawn(executable, args, {
            shell: true,
            stdio: ["pipe", process.stdout, process.stderr],
            ...opts,
        });
        child.on("error", reject);
        child.on("exit", (code) => {
            if (code === 0) {
                resolve(code);
            } else {
                const e = new Error("Process exited with error code " + code);
                reject(e);
            }
        });
    });
}
