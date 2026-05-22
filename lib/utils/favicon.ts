export function getFaviconUrl(domain: string, size = 32): string {
  const clean = domain.replace(/^www\./, "");
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(clean)}&sz=${size}`;
}
