/** Nahraje PNG rámu fóra (351×439, Instagram 4:5) na server a vrátí veřejnou URL. */
export async function uploadForumPosterFrame(blob: Blob): Promise<string> {
  const pngBase64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Nepodařilo se převést obrázek."));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Nepodařilo se převést obrázek."));
    reader.readAsDataURL(blob);
  });

  const posterUrl = "/api/forum/poster-frame";
  const res = await fetch(posterUrl, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pngBase64 }),
  });
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !data.url) {
    throw new Error(data.error ?? "Nepodařilo se nahrát náhled sestavy.");
  }
  return data.url;
}
