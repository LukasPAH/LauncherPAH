import { addProfile, removeProfile, editProfile } from "../../managers/profile/readProfiles";

export async function addProfileEventResponse(profile: string, index: number, beforeName?: string) {
    if (beforeName === undefined) await addProfile(profile, index);
    if (beforeName !== undefined) await editProfile(profile, index, beforeName)
}

export async function removeProfileEventResponse(profile: string) {
    removeProfile(profile);
}
