import "dotenv/config";
import { db } from "./connection.js";
import { creatorProfiles } from "./schema.js";

async function seed() {
  console.log("Seeding MEDIAAI database...\n");

  // Check if Kristina's profile already exists
  const existing = await db.select().from(creatorProfiles);
  if (existing.length > 0) {
    console.log("Creator profile already exists. Skipping seed.");
    process.exit(0);
  }

  const [kristina] = await db
    .insert(creatorProfiles)
    .values({
      name: "Kristina Subbotina",
      brandName: "Lexsy",
      niche: "Startup Legal Education",
      audience:
        "Startup founders, early-stage operators, startup teams, people needing practical legal guidance for startups",
      tone: "Credible, direct, practical, founder-native, sharp, modern — not stiff or overly corporate",
      businessGoals:
        "Attract founders, educate audience, position Lexsy as modern startup counsel, build trust through actionable content, grow thought leadership in startup legal space",
      themesToAvoid:
        "Generic lawyer boilerplate, fearmongering, vague content advice, generic influencer-style language, overly technical legal theory without practical context",
      platformPreferences: {
        youtube: "https://www.youtube.com/@KristinaSubbotinaEsq/shorts",
        instagram: "https://www.instagram.com/kristinasubbotina.esq/",
      },
      notes:
        "Core content themes: startup legal mistakes, fundraising readiness, due diligence, contracts, founder risk prevention, developer agreements, practical startup legal education. Content should feel credible and founder-friendly — like talking to a sharp advisor, not a corporate law firm.",
    })
    .returning();

  console.log(`Created creator profile: ${kristina.name} (${kristina.id})`);
  console.log(`Brand: ${kristina.brandName}`);
  console.log(`Niche: ${kristina.niche}`);
  console.log(`\nDone! Creator ID: ${kristina.id}\n`);

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
