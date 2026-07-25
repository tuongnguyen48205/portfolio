import { getStore } from "@netlify/blobs";

export default async () => {
  const store = getStore("portfolio");
  let current = 0;
  try {
    current = parseInt(await store.get("view_count")) || 0;
  } catch (e) {}
  current += 1;
  await store.set("view_count", String(current));

  return new Response(JSON.stringify({ count: current }), {
    headers: { "Content-Type": "application/json" }
  });
};
