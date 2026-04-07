interface IProtonOptions {
    enableLogging?: boolean;
    enableHDR?: boolean;
    enableWayland?: boolean;
    protonGDKVersion: string;
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
