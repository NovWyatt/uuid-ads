import { zipSync, type Zippable } from 'fflate';

// Swapped in for write-excel-file's async zip (see vite configs). fflate's async zip spawns a
// Worker from a blob: URL, which Facebook's Content Security Policy can block.
export default function zipToArrayBuffer(files: Zippable): Promise<ArrayBuffer> {
    return Promise.resolve(zipSync(files).buffer as ArrayBuffer);
}
