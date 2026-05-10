import { window } from "../../main";
import { updateLastLaunchedProfileName } from "../../settings";

export async function setSelectedProfile(profile: IProfile) {
    updateLastLaunchedProfileName(profile.name);
    window?.webContents.send("selectedProfile", profile);
}

export async function setSelectedProfileOnStart(profile: IProfile) {
    window?.webContents.send("selectedProfile", profile);
}
