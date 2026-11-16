// Starts the hosted server. Settings come from the environment (locally: .env.local, see the README).
import path from "node:path";
import pg from "pg";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { createApp, SCHEMA } from "./app.js";

const { IAP_AUDIENCE, DEV_USER_EMAIL, UNSPLASH_ACCESS_KEY, PORT = 8080 } = process.env;

// On Google Cloud, IAP (the Google sign-in gate) signs every request with who is signed in. We check that
// signature here too, so a request that somehow skipped the gate is refused rather than trusted.
function iapIdentify(audience) {
  const keys = createRemoteJWKSet(new URL("https://www.gstatic.com/iap/verify/public_key-jwk"));
  return async (req) => {
    const token = req.get("x-goog-iap-jwt-assertion");
    if (!token) return null;
    const { payload } = await jwtVerify(token, keys, { issuer: "https://cloud.google.com/iap", audience });
    return payload.email || null;
  };
}

if (!IAP_AUDIENCE && !DEV_USER_EMAIL) {
  console.error("Set IAP_AUDIENCE (hosted) or DEV_USER_EMAIL (local only: everyone is signed in as that email).");
  process.exit(1);
}
const identify = IAP_AUDIENCE ? iapIdentify(IAP_AUDIENCE) : async () => DEV_USER_EMAIL;

const pool = new pg.Pool(); // Reads PGHOST, PGPORT, PGUSER, PGPASSWORD and PGDATABASE.
await pool.query(SCHEMA);

createApp({ pool, identify, unsplashKey: UNSPLASH_ACCESS_KEY, staticDir: path.resolve("dist") }).listen(PORT, () => {
  console.log(`KAI server on port ${PORT}, ${IAP_AUDIENCE ? "Google sign-in required" : `signed in as ${DEV_USER_EMAIL}`}`);
});
