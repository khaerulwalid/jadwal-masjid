import { db } from "./src/db";
import { residents, groupMembers } from "./src/db/schema";
import { eq, isNull, sql, and } from "drizzle-orm";

async function main() {
  const sq = db
      .select({ residentId: groupMembers.residentId })
      .from(groupMembers)
      .where(isNull(groupMembers.leftAt));

  const conditions = [
    eq(residents.isActive, true),
    sql`${residents.id} NOT IN (${sq})`
  ];

  const result = await db
      .select({
        id: residents.id,
        name: residents.name,
      })
      .from(residents)
      .where(and(...conditions))
      .limit(30);

  console.log("Result:", result);
  process.exit(0);
}

main().catch(console.error);
