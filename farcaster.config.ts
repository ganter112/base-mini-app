const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const farcasterConfig = {
  accountAssociation: {
    header: "",
    payload: "",
    signature: ""
  },
  miniapp: {
    version: "1",
    name: "Fruit Ninja",
    subtitle: "Slice fruits, beat records!",
    description: "Classic fruit slicing game. Swipe to slice fruits, avoid bombs, build combos!",
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
    iconUrl: `${ROOT_URL}/blue-icon.png`,
    splashImageUrl: `${ROOT_URL}/blue-hero.png`,
    splashBackgroundColor: "#0a0a1a",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "games",
    tags: ["games", "arcade", "fruit-ninja", "casual"],
    heroImageUrl: `${ROOT_URL}/blue-hero.png`,
    tagline: "Slice fruits, beat records!",
    ogTitle: "Fruit Ninja",
    ogDescription: "Can you beat my score? Play Fruit Ninja on Farcaster!",
    ogImageUrl: `${ROOT_URL}/blue-hero.png`,
  },
} as const;
