import fsAsync from "fs/promises";

export async function fixMinecraftTenFontMetadata(file: string) {
    const fileContents = (await fsAsync.readFile(file)).toString();
    const fontMetadata = JSON.parse(fileContents) as IFontMetadata;
    for (const font of fontMetadata.fonts) {
        if (font.font_name !== "MinecraftTen") continue;

        if (font.version === undefined) {
            font.version = 2;
            return;
        }

        font.version = font.version + 1;

        break;
    }

    const outputMetadata = JSON.stringify(fontMetadata, null, 4);

    await fsAsync.writeFile(file, outputMetadata);
}
