export const NO_CHROME_PATHS: ReadonlySet<string> = new Set<string>([
  "/login",
]);

export function shouldShowChrome(pathname: string): boolean {
  return !NO_CHROME_PATHS.has(pathname);
}
