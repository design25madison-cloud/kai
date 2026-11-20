// The three Google Cloud services the materials feature uses: the uploads bucket, Gemini, and the
// converter service. All calls sign in as the service the app runs as, so there is no API key.
// Tests pass a fake of this object instead (see app.test.js).
import { GoogleAuth } from "google-auth-library";

export function createCloud({ project, bucket, converterUrl, model = "gemini-3.7-flash" }) {
  const auth = new GoogleAuth({ scopes: ["https://www.googleapis.com/auth/cloud-platform"] });

  async function call(url, options = {}, token) {
    const res = await fetch(url, { ...options, headers: { ...options.headers, Authorization: `Bearer ${token || (await auth.getAccessToken())}` } });
    if (!res.ok && !(options.method === "DELETE" && res.status === 404)) {
      throw new Error(`${options.method || "GET"} ${new URL(url).pathname} failed: ${res.status} ${(await res.text()).slice(0, 300)}`);
    }
    return res;
  }
  const storage = "https://storage.googleapis.com";

  return {
    // Where Gemini reads a stored file from.
    uri: (name) => `gs://${bucket}/${name}`,

    async put(name, bytes, contentType) {
      await call(`${storage}/upload/storage/v1/b/${bucket}/o?uploadType=media&name=${encodeURIComponent(name)}`, {
        method: "POST",
        headers: { "Content-Type": contentType },
        body: bytes,
      });
    },

    async remove(name) {
      await call(`${storage}/storage/v1/b/${bucket}/o/${encodeURIComponent(name)}`, { method: "DELETE" });
    },

    // PowerPoint or Word bytes in, PDF bytes out. Only this app's service account may call the converter.
    async toPdf(bytes, ext) {
      const client = await auth.getIdTokenClient(converterUrl);
      const token = await client.idTokenProvider.fetchIdToken(converterUrl);
      const res = await call(`${converterUrl}/convert?ext=${ext}`, { method: "POST", headers: { "Content-Type": "application/octet-stream" }, body: bytes }, token);
      return Buffer.from(await res.arrayBuffer());
    },

    // One Gemini call that must answer in the given JSON shape. files: [{ uri, mimeType }], text is
    // the team's pasted notes, ask is the instruction that closes the request.
    async generate({ system, files = [], text, schema, ask }) {
      const parts = files.map((f) => ({ fileData: { fileUri: f.uri, mimeType: f.mimeType } }));
      if (text) parts.push({ text: `Notes pasted by the team:\n\n${text}` });
      parts.push({ text: ask });
      const res = await call(`https://aiplatform.googleapis.com/v1/projects/${project}/locations/global/publishers/google/models/${model}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts }],
          generationConfig: { responseMimeType: "application/json", responseSchema: schema, temperature: 0.2, maxOutputTokens: 16000 },
        }),
      });
      const candidate = ((await res.json()).candidates || [])[0] || {};
      const answer = ((candidate.content && candidate.content.parts) || []).map((p) => p.text || "").join("");
      if (candidate.finishReason !== "STOP" || !answer) throw new Error(`Gemini stopped with ${candidate.finishReason || "no answer"}`);
      return JSON.parse(answer);
    },
  };
}
