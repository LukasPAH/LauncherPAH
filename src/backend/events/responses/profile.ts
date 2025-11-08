import { addProfile, removeProfile } from "../../managers/profile/readProfiles";

export async function addProfileEventResponse(profile: string, index: number) {
    await addProfile(profile, index);
}

export async function removeProfileEventResponse(profile: string) {
    removeProfile(profile);
}
