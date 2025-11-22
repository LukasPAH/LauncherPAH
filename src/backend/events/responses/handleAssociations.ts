import { fileAssociations } from "../../../../fileAssociations";

export async function handleAssociations(path: string | string[]) {
    let filePath = "";
    if (typeof path === "string") filePath = path;
    else {
        for (const association of fileAssociations) {
            const findResult = path.find((arg) => arg.endsWith(association));
            if (findResult === undefined) continue;
            filePath = findResult;
            break;
        }
    }
    if (filePath === "") return;
    console.log(filePath);
}
