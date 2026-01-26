import pako from "pako";

/**
 * Compress a base64 string using gzip
 * Returns a compressed base64 string
 */
export function compressBase64(base64: string): { compressed: string; originalSize: number; compressedSize: number } {
    // Convert base64 to Uint8Array
    const binaryString = atob(base64.split(",")[1] || base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    // Compress using pako
    const compressed = pako.gzip(bytes, { level: 6 });

    // Convert compressed data back to base64
    let compressedBase64 = "";
    const chunkSize = 0x8000; // Process in chunks to avoid call stack overflow
    for (let i = 0; i < compressed.length; i += chunkSize) {
        compressedBase64 += String.fromCharCode.apply(null, Array.from(compressed.subarray(i, i + chunkSize)));
    }

    return {
        compressed: btoa(compressedBase64),
        originalSize: bytes.length,
        compressedSize: compressed.length,
    };
}

/**
 * Decompress a compressed base64 string
 * Returns the original base64 string with data URL prefix
 */
export function decompressBase64(compressedBase64: string, mimeType = "application/pdf"): string {
    // Convert base64 to Uint8Array
    const binaryString = atob(compressedBase64);
    const compressed = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        compressed[i] = binaryString.charCodeAt(i);
    }

    // Decompress using pako
    const decompressed = pako.ungzip(compressed);

    // Convert back to base64
    let base64 = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < decompressed.length; i += chunkSize) {
        base64 += String.fromCharCode.apply(null, Array.from(decompressed.subarray(i, i + chunkSize)));
    }

    return `data:${mimeType};base64,${btoa(base64)}`;
}
