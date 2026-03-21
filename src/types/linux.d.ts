interface IProtonOptions {
    wayland?: boolean;
    hdr?: boolean;
    logging?: boolean;
    protonPath: string;
}

interface IProtonSourceDetails {
    author: string;
    repo: string;
}

interface IAvailableProtonVersion {
    name: string;
    url: string;
    author: string;
}
