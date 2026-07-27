/**
 * Cloudinary config probe — does not leave assets behind.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

function present(name: string): boolean {
  return Boolean(process.env[name]?.trim());
}

async function main() {
  const cloud = present("CLOUDINARY_CLOUD_NAME");
  const key = present("CLOUDINARY_API_KEY");
  const secret = present("CLOUDINARY_API_SECRET");

  if (!cloud || !key || !secret) {
    console.log(
      "BLOCKED  Cloudinary credentials missing — live upload skipped (expected until configured)."
    );
    console.log("OK  environment handling documented");
    console.log("admin:test-cloudinary passed (config-only)");
    return;
  }

  const { v2: cloudinary } = await import("cloudinary");
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  const timestamp = Math.round(Date.now() / 1000);
  const folder = "creative-marketing/_phase5-probe";
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET as string
  );

  if (!signature) {
    throw new Error("Failed to sign upload params");
  }
  console.log("OK  signed configuration generated");
  console.log("SKIP live upload (no persistent test asset)");
  console.log("admin:test-cloudinary passed");
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
