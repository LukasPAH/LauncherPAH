import { exec } from "child_process";
import * as path from "path";

export async function isJunction(targetPath: string) {
    return new Promise((resolve) => {
        const absolutePath = path.resolve(targetPath);

        exec(`fsutil reparsepoint query "${absolutePath}"`, (error, stdout) => {
            if (error) {
                resolve(false);
                return;
            }
            if (stdout.toLowerCase().includes("0xa0000003")) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
}
