export {};

interface IElectronAPI {
    send: (channel: string, data: any) => void;
    on: (channel: string, callback: (...args: any[]) => void) => () => void;
    invoke: (channel: string, data: any) => Promise<any>;
}

declare global {
    interface Window {
        electronAPI: IElectronAPI;
    }
}
