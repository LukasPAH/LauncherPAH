/* eslint-disable @typescript-eslint/no-var-requires */
const { MakerWix } = require("@electron-forge/maker-wix");
const { MakerRpm } = require("@electron-forge/maker-rpm");
//const { MakerDeb } = require("@electron-forge/maker-deb");
const { VitePlugin } = require("@electron-forge/plugin-vite");
const { FusesPlugin } = require("@electron-forge/plugin-fuses");
const { FuseV1Options, FuseVersion } = require("@electron/fuses");
const { fileAssociationString } = require("./fileAssociations");
/* eslint-enable @typescript-eslint/no-var-requires */

/** @type {import("@electron-forge/shared-types").ForgeConfig} */
const config = {
    packagerConfig: {
        asar: true,
        icon: "images/icon.ico",
        download: {
            checksums: {
                "electron-v42.4.0-linux-x64.zip": "9a8194635548490a56099cc4c2b116738ae56834dee4472506d5a8b262bcbda4",
            },
        },
        extraResources: [
            {
                from: "./images/icon.png",
                to: "images/icon.png",
            },
        ],
    },
    rebuildConfig: {},
    makers: [
        new MakerWix({
            manufacturer: "LukasPAH",
            name: "LauncherPAH",
            language: 1033,
            appUserModelId: "LauncherPAH",
            shortName: "LauncherPAH",
            description: "Minecraft GDK Launcher",
            icon: __dirname + "\\images\\icon.ico",
            arch: "x64",
            defaultInstallMode: "perMachine",
            associateExtensions: fileAssociationString(),
            bundled: true,
            ui: {
                chooseDirectory: true,
            },
        }),
        new MakerRpm({
            options: {
                name: "LauncherPAH",
                icon: __dirname + "/images/icon.png",
                categories: ["Game"],
            },
        }),
        // new MakerDeb({
        //   options: {
        //     name: "LauncherPAH",
        //     icon: __dirname + "/images/icon.png",
        //     categories: ["Game"],
        //   },
        // }),
    ],
    plugins: [
        new VitePlugin({
            build: [
                {
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

module.exports = config;
