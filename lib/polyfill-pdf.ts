// @ts-nocheck
import DOMMatrix from "dommatrix";

// Polyfill DOMMatrix if it doesn't exist (Node environment)
if (typeof global.DOMMatrix === "undefined") {
    global.DOMMatrix = DOMMatrix;
}

// Ensure Promise.withResolvers exists (Node 22+ has it, Node 20 might not depending on version)
if (typeof Promise.withResolvers === "undefined") {
    Promise.withResolvers = function <T>() {
        let resolve, reject;
        const promise = new Promise<T>((res, rej) => {
            resolve = res;
            reject = rej;
        });
        return { promise, resolve, reject };
    };
}
