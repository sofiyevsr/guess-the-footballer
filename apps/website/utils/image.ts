export function formatRemoteImage(src: string) {
  return src
    .replaceAll("verysmall", "head")
    .replaceAll("small", "head")
    .replaceAll("middle", "head")
    .replaceAll("normal", "header");
}
