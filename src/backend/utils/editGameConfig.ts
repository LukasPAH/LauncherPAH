import { existsSync } from "fs";
import * as fsAsync from "fs/promises";
import * as path from "path";

const GAME_CONFIG_NAME = "MicrosoftGame.Config";

const TITLE_ID_REGEX = /<TitleId>.*<\/TitleId>/;
const TARGET_TITLE_ID = "<TitleId>67b57dac</TitleId>";

const APP_ID_REGEX = /<MSAAppId>.*<\/MSAAppId>/;
const TARGET_APP_ID = "<MSAAppId>0000000048183522</MSAAppId>";

export async function editConfigFile(installationFolder: string) {
    const configFilePath = path.join(installationFolder, GAME_CONFIG_NAME);

    if (!existsSync(configFilePath)) {
        return;
    }

    const configFileString = (await fsAsync.readFile(configFilePath)).toString();

    const newString = configFileString.replace(TITLE_ID_REGEX, TARGET_TITLE_ID).replace(APP_ID_REGEX, TARGET_APP_ID);

    await fsAsync.writeFile(configFilePath, newString);
}
