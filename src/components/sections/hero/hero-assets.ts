import "server-only";

import { existsSync } from "node:fs";
import path from "node:path";

/** Optional transparent hand+phone asset path for future drop-in. */
export const HERO_HAND_ASSET_PATH = "/hero/hand-phone.webp";

export function heroHandAssetExists(): boolean {
  return existsSync(
    path.join(process.cwd(), "public", "hero", "hand-phone.webp")
  );
}
