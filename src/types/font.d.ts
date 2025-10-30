interface IFont {
    font_formant: string;
    font_name: string;
    version: number | undefined;
    font_file: string;
    lowPerformanceCompatible?: boolean | undefined;
}

interface IFontMetadata {
    version: number;
    fonts: IFont[];
}
