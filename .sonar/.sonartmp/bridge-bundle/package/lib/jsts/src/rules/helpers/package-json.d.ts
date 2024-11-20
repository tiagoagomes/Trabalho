import { type PackageJson } from 'type-fest';
import { Minimatch } from 'minimatch';
import { type Filesystem } from './find-up';
export declare const PACKAGE_JSON = "package.json";
/**
 * Retrieve the dependencies of all the package.json files available for the given file.
 *
 * @param filename context.filename
 * @param cwd working dir, will search up to that root
 * @returns
 */
export declare function getDependencies(filename: string, cwd: string): Set<string | Minimatch>;
export declare function getDependenciesFromPackageJson(content: PackageJson): Set<string | Minimatch>;
/**
 * Returns the project manifests that are used to resolve the dependencies imported by
 * the module named `filename`, up to the passed working directory.
 */
export declare const getManifests: (dir: string, workingDirectory?: string, fileSystem?: Filesystem) => Array<PackageJson>;
