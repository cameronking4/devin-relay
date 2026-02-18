/**
 * Infer dot-notation paths from JSON payload(s).
 * Merges paths from multiple payloads and returns unique, sorted paths.
 * Uses "payload." prefix for consistency with condition examples.
 */
export function inferPayloadPaths(payloads: unknown[]): string[] {
    const pathSet = new Set<string>();

    for (const payload of payloads) {
        if (payload == null) continue;
        const paths = flattenToPaths(payload, "payload");
        for (const p of paths) pathSet.add(p);
    }

    return [...pathSet].sort();
}

function flattenToPaths(obj: unknown, prefix: string): string[] {
    const paths: string[] = [];

    if (obj == null || typeof obj !== "object") {
        if (prefix) paths.push(prefix);
        return paths;
    }

    if (Array.isArray(obj)) {
        paths.push(prefix);
        // Use first element to infer structure if it's an object
        const first = obj[0];
        if (
            first != null &&
            typeof first === "object" &&
            !Array.isArray(first) &&
            Object.keys(first as object).length > 0
        ) {
            paths.push(...flattenToPaths(first, `${prefix}.0`));
        }
        return paths;
    }

    const record = obj as Record<string, unknown>;
    const keys = Object.keys(record);

    if (keys.length === 0) {
        paths.push(prefix);
        return paths;
    }

    for (const key of keys) {
        const value = record[key];
        const path = prefix ? `${prefix}.${key}` : key;

        if (
            value != null &&
            typeof value === "object" &&
            !Array.isArray(value) &&
            Object.keys(value as object).length > 0
        ) {
            paths.push(...flattenToPaths(value, path));
        } else {
            paths.push(path);
        }
    }

    return paths;
}
