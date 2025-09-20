import child_process from "child_process";
import util from "util";

const execAsync = util.promisify(child_process.exec);

export async function run(command: string) {
    const { stderr, stdout } = await execAsync(command, { shell: "powershell.exe" });
    if (stderr) console.error(`Error: ${stderr}`);
    else console.log(stdout);
}
