export function guidToBytes(guid: string): Uint8Array {
    const hex = guid.replace(/-/g, "");
    const bytes = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
        bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }

    return new Uint8Array([
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        bytes[3]!,
        bytes[2]!,
        bytes[1]!,
        bytes[0]!,
        bytes[5]!,
        bytes[4]!,
        bytes[7]!,
        bytes[6]!,
        /* eslint-enable @typescript-eslint/no-non-null-assertion */
        ...bytes.slice(8),
    ]);
}

export function hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return bytes;
}
