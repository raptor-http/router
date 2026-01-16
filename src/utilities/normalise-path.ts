/**
 * Normalise a pathname by removing duplicate slashes and trailing slashes.
 *
 * @param path The pathname to normalise.
 *
 * @returns The normalised pathname.
 */
const normalisePath = (path: string): string => {
  const deduplicated = path.replace(/\/+/g, "/");
  return deduplicated === "/" ? "/" : deduplicated.replace(/\/+$/, "");
};

export default normalisePath;
