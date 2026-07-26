import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const root = new URL(".", import.meta.url);
const output = new URL("./dist/server/index.js", root);

const assetDefinitions = [
  ["/", "index.html", "text/html; charset=utf-8"],
  ["/index.html", "index.html", "text/html; charset=utf-8"],
  ["/accretion.js", "accretion.js", "text/javascript; charset=utf-8"],
  [
    "/assets/logo_dec_blk_transp.png",
    "assets/logo_dec_blk_transp.png",
    "image/png"
  ]
];

const assets = await Promise.all(
  assetDefinitions.map(async ([pathname, filename, contentType]) => {
    const source = await readFile(new URL(filename, root));
    const binary = contentType === "image/png";

    return [
      pathname,
      {
        body: binary ? source.toString("base64") : source.toString("utf8"),
        contentType,
        encoding: binary ? "base64" : "utf8"
      }
    ];
  })
);

const worker = `
const assets = new Map(${JSON.stringify(assets)});

const decodeBase64 = (value) => {
  const decoded = atob(value);
  const bytes = new Uint8Array(decoded.length);

  for (let index = 0; index < decoded.length; index += 1) {
    bytes[index] = decoded.charCodeAt(index);
  }

  return bytes;
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const asset = assets.get(url.pathname);

    if (!asset) {
      return new Response("Not found", {
        status: 404,
        headers: { "content-type": "text/plain; charset=utf-8" }
      });
    }

    const body = asset.encoding === "base64"
      ? decodeBase64(asset.body)
      : asset.body;
    const cacheControl = asset.contentType.startsWith("text/html")
      ? "no-cache"
      : "public, max-age=604800, immutable";

    return new Response(body, {
      headers: {
        "content-type": asset.contentType,
        "cache-control": cacheControl,
        "x-content-type-options": "nosniff"
      }
    });
  }
};
`;

await rm(new URL("./dist", root), { recursive: true, force: true });
await mkdir(dirname(output.pathname), { recursive: true });
await writeFile(output, worker.trimStart());

console.log(join("dist", "server", "index.js"));
