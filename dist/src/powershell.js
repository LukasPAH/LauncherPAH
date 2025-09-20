"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const child_process_1 = require("child_process");
async function run(executable, args, opts = {}) {
    return new Promise((resolve, reject) => {
        const child = (0, child_process_1.spawn)(executable, args, {
            shell: true,
            stdio: ["pipe", process.stdout, process.stderr],
            ...opts,
        });
        child.on("error", reject);
        child.on("exit", (code) => {
            if (code === 0) {
                resolve(code);
            }
            else {
                const e = new Error("Process exited with error code " + code);
                reject(e);
            }
        });
    });
}
exports.run = run;
//# sourceMappingURL=powershell.js.map