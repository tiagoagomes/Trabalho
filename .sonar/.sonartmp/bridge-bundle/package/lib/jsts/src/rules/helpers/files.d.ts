/**
 * Synchronous read of file contents from a file path
 *
 * The function gets rid of any Byte Order Marker (BOM)
 * present in the file's header.
 *
 * @param filePath the path of a file
 * @returns Promise which resolves with the content of the file
 */
export declare function readFileSync(filePath: string): string;
/**
 * Removes any Byte Order Marker (BOM) from a string's head
 *
 * A string's head is nothing else but its first character.
 *
 * @param str the input string
 * @returns the stripped string
 */
export declare function stripBOM(str: string): string;
/**
 * Converts a path to Unix format
 * @param path the path to convert
 * @returns the converted path
 */
export declare function toUnixPath(path: string): string;
/**
 * Find nearest file with a given name in current or parent dirs
 * @param dir
 * @param name filename to search for
 */
export declare function findParent(dir: string, name: string): string | null;
export declare function isRoot(file: string): boolean;
