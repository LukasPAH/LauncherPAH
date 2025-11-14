import { cp, mkdir, rename } from "node:fs/promises";
import { existsSync } from "fs";
import { GDKPreviewUsersFolder, GDKReleaseUsersFolder, profilesLocation } from "../../settings";
import path from "node:path";
import { isJunction } from "../../utils/isJunction";

async function copyGDKUserData(from: string, target: string) {
    await cp(from, target, { recursive: true });
}

async function createGDKProfileFolder(type: "Release" | "Preview", profile: string) {
    let GDKFolder = GDKReleaseUsersFolder;
    if (type === "Preview") GDKFolder = GDKPreviewUsersFolder;
    path.join(profilesLocation, profile);
}

export async function tryMigrageGDKUserData() {
    const releaseFolder = GDKReleaseUsersFolder;
    const previewFolder = GDKPreviewUsersFolder;
    const targetReleaseFolder = path.join(profilesLocation, "Default");
    const targetPreviewFolder = path.join(profilesLocation, "Preview");

    const releaseIsJunction = await isJunction(releaseFolder);
    const previewIsJunction = await isJunction(previewFolder);

    if (!releaseIsJunction) {
        if (!existsSync(targetReleaseFolder)) {
            await mkdir(targetReleaseFolder, { recursive: true });
        }
        await copyGDKUserData(releaseFolder, targetReleaseFolder);
        await keepRenaming(releaseFolder, releaseFolder + "_bak");
        // symlink(targetReleaseFolder, releaseFolder, "junction", () => {
        //     0;
        // });
    }

    if (!previewIsJunction) {
        if (!existsSync(targetPreviewFolder)) {
            await mkdir(targetPreviewFolder, { recursive: true });
        }
        await copyGDKUserData(previewFolder, targetPreviewFolder);
        await keepRenaming(previewFolder, previewFolder + "_bak");
        // symlink(targetPreviewFolder, previewFolder, "junction", () => {
        //     0;
        // });
    }
}

async function keepRenaming(folder: string, target: string) {
    try {
        await rename(folder, target);
    } catch (error) {
        await keepRenaming(folder, target);
    }
}
