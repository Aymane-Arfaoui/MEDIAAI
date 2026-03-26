import "dotenv/config";
import { db } from "./connection.js";
import { sql } from "drizzle-orm";
import { creatorProfiles } from "./schema.js";

async function reset() {
  console.log("🗑️  Clearing all MEDIAAI data...\n");

  await db.execute(sql`TRUNCATE TABLE chat_messages CASCADE`);
  await db.execute(sql`TRUNCATE TABLE chat_sessions CASCADE`);
  await db.execute(sql`TRUNCATE TABLE planned_contents CASCADE`);
  await db.execute(sql`TRUNCATE TABLE weekly_plans CASCADE`);
  await db.execute(sql`TRUNCATE TABLE knowledge_chunks CASCADE`);
  await db.execute(sql`TRUNCATE TABLE knowledge_documents CASCADE`);
  await db.execute(sql`TRUNCATE TABLE analytics_summaries CASCADE`);
  await db.execute(sql`TRUNCATE TABLE content_items CASCADE`);
  await db.execute(sql`TRUNCATE TABLE creator_profiles CASCADE`);

  console.log("✅ All tables cleared\n");

  // Re-seed Kristina's profile
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
        "Core content themes: startup legal mistakes, fundraising readiness, due diligence, contracts, founder risk prevention, developer agreements, practical startup legal education.",
    })
    .returning();

  console.log(`👤 Re-created creator: ${kristina.name} (${kristina.id})`);
  console.log(`🏢 Brand: ${kristina.brandName}`);
  console.log(`\n🎬 Ready for demo! Use the app to ingest YouTube + Instagram data.\n`);

  process.exit(0);
}

reset().catch((err) => {
  console.error("Reset failed:", err);
  process.exit(1);
});
