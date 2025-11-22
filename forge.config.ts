import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerWix } from "@electron-forge/maker-wix";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";
import { fileAssociationString } from "./fileAssociations";

const config: ForgeConfig = {
    packagerConfig: {
        asar: true,
        icon: "images/icon.ico",
    },
    rebuildConfig: {},
    makers: [
        new MakerWix({
            manufacturer: "LukasPAH",
            name: "LauncherPAH",
            language: 1033, // English
            appUserModelId: "LauncherPAH",
            shortName: "LauncherPAH",
            description: "Minecraft GDK Launcher",
            icon: __dirname + "\\images\\icon.ico",
            arch: "x64",
            defaultInstallMode: "perMachine",
            associateExtensions: fileAssociationString(),
            bundled: true,
            ui: {
                chooseDirectory: true
            }
        }),
    ],
    plugins: [
        new VitePlugin({
            // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
            // If you are familiar with Vite configuration, it will look really familiar.
            build: [
                {
                    // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
                    entry: "src/backend/main.ts",
                    config: "vite.main.config.ts",
                    target: "main",
                },
                {
                    entry: "src/preload.ts",
                    config: "vite.preload.config.ts",
                    target: "preload",
                },
            ],
            renderer: [
                {
                    name: "main_window",
                    config: "vite.renderer.config.ts",
                },
            ],
        }),
        // Fuses are used to enable/disable various Electron functionality
        // at package time, before code signing the application
        new FusesPlugin({
            version: FuseVersion.V1,
            [FuseV1Options.RunAsNode]: false,
            [FuseV1Options.EnableCookieEncryption]: true,
            [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
            [FuseV1Options.EnableNodeCliInspectArguments]: false,
            [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
            [FuseV1Options.OnlyLoadAppFromAsar]: true,
        }),
    ],
};

export default config;
