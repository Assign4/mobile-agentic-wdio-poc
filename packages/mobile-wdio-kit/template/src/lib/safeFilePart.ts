/** Sanitize a string for use as a single filename segment (screenshots, etc.). */
export function safeFilePart(value: string): string {
  return value.replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/-+/g, "-");
}
