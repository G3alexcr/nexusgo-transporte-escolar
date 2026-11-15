export function pageHead(title: string, description: string) {
  return { meta: [{ title: `${title} — Nexus Go` }, { name: "description", content: description }, { property: "og:title", content: `${title} — Nexus Go` }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] };
}