/**
 * @param {string} base - The "source" file path (e.g., "/mmo/maps/map.tmj")
 * @param {string} relative - The target path (e.g., "../tilesets/set.tsx")
 */
export function combinePaths(base, relative) {
    const dummy = "https://sophiawhite.dev";
    const baseUrl = new URL(base, dummy);
    const resolved = new URL(relative, baseUrl);
    return resolved.pathname;
}