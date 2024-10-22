export function formatRemoteImage(src: string) {
  return src
    .replaceAll("verysmall", "head")
    .replaceAll("small", "head")
    .replaceAll("medium", "head")
    .replaceAll("normal", "header");
}
