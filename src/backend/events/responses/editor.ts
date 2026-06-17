import { getLastLaunchedProfile, setProfileEditor } from "../../settings";
import { window } from "../../main";

export function toggleEditor(isEditor: boolean) {
    const profile = getLastLaunchedProfile();
    if (profile === undefined) {
        return;
    }
    setProfileEditor(profile, isEditor);
    window?.webContents.send("isEditor", profile.editor);
}

export function setEditorOnStart() {
    const profile = getLastLaunchedProfile();
    if (profile === undefined) {
        return;
    }
    window?.webContents.send("isEditor", profile.editor);
}
