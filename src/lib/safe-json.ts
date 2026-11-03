// JSON embedded in HTML must not be able to terminate its script element.
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
