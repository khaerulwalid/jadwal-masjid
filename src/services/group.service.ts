import { db } from "@/db";
import { groups, groupMembers, residents, rotationState } from "@/db/schema";
import { eq, ilike, and, or, sql, asc, isNull, inArray, desc } from "drizzle-orm";
import { GroupInput } from "@/lib/validation/group";
import { getCurrentLocalDate } from "@/lib/date";

export type GetGroupsParams = {
  search?: string;
  status?: "all" | "active" | "inactive";
};

export class GroupService {
  static async getGroups(params?: GetGroupsParams) {
    const conditions = [];

    if (params?.search) {
      conditions.push(ilike(groups.name, `%${params.search}%`));
    }

    if (params?.status === "active") {
      conditions.push(eq(groups.isActive, true));
    } else if (params?.status === "inactive") {
      conditions.push(eq(groups.isActive, false));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    // Use a CTE or just left join and group by to get member count
    const result = await db
      .select({
        id: groups.id,
        name: groups.name,
        sequenceNo: groups.sequenceNo,
        isActive: groups.isActive,
        memberCount: sql<number>`cast(count(${groupMembers.id}) as integer)`,
      })
      .from(groups)
      .leftJoin(
        groupMembers,
        and(
          eq(groupMembers.groupId, groups.id),
          isNull(groupMembers.leftAt)
        )
      )
      .where(where)
      .groupBy(groups.id)
      .orderBy(asc(groups.sequenceNo));

    return result;
  }

  static async getGroupById(id: string) {
    const result = await db
      .select()
      .from(groups)
      .where(eq(groups.id, id))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  static async createGroup(input: GroupInput) {
    const result = await db
      .insert(groups)
      .values({
        name: input.name,
        sequenceNo: input.sequenceNo,
        isActive: true,
      })
      .returning();

    return result[0];
  }

  static async updateGroup(id: string, input: GroupInput) {
    const result = await db
      .update(groups)
      .set({
        name: input.name,
        sequenceNo: input.sequenceNo,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(groups.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error("Data kelompok tidak ditemukan.");
    }

    return result[0];
  }

  static async setGroupActiveStatus(id: string, isActive: boolean) {
    // Check if group has active members when deactivating
    if (!isActive) {
      const activeMembers = await db
        .select({ count: sql<number>`count(*)` })
        .from(groupMembers)
        .where(
          and(
            eq(groupMembers.groupId, id),
            isNull(groupMembers.leftAt)
          )
        );

      if (activeMembers[0].count > 0) {
        throw new Error("Kelompok masih memiliki anggota aktif. Pindahkan atau keluarkan semua anggota terlebih dahulu.");
      }

      // Check if group is next in rotation
      const nextGroupState = await db
        .select()
        .from(rotationState)
        .limit(1);

      if (nextGroupState.length > 0 && nextGroupState[0].nextGroupId === id) {
        throw new Error("Kelompok ini sedang menjadi kelompok berikutnya pada rotasi. Ubah kelompok berikutnya terlebih dahulu.");
      }
    }

    const result = await db
      .update(groups)
      .set({
        isActive: isActive,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(groups.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error("Data kelompok tidak ditemukan.");
    }

    return result[0];
  }

  static async getGroupMembers(groupId: string) {
    return await db
      .select({
        membershipId: groupMembers.id,
        residentId: residents.id,
        name: residents.name,
        phone: residents.phone,
        joinedAt: groupMembers.joinedAt,
      })
      .from(groupMembers)
      .innerJoin(residents, eq(groupMembers.residentId, residents.id))
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          isNull(groupMembers.leftAt)
        )
      )
      .orderBy(asc(residents.name));
  }

  static async getAvailableResidents(search?: string) {
    // Residents that are active and do not have an active membership
    // Using NOT EXISTS or LEFT JOIN WHERE NULL
    const sq = db
      .select({ residentId: groupMembers.residentId })
      .from(groupMembers)
      .where(isNull(groupMembers.leftAt));

    const conditions = [
      eq(residents.isActive, true),
      sql`${residents.id} NOT IN (${sq})`
    ];

    if (search) {
      const orCondition = or(
        ilike(residents.name, `%${search}%`),
        ilike(residents.phone, `%${search}%`)
      );
      if (orCondition) {
        conditions.push(orCondition);
      }
    }

    return await db
      .select({
        id: residents.id,
        name: residents.name,
        phone: residents.phone,
      })
      .from(residents)
      .where(and(...conditions))
      .orderBy(asc(residents.name))
      .limit(30);
  }

  static async assignResidentToGroup(groupId: string, residentId: string) {
    return await db.transaction(async (tx) => {
      // Validate group is active
      const groupResult = await tx
        .select()
        .from(groups)
        .where(eq(groups.id, groupId))
        .limit(1);

      if (groupResult.length === 0) throw new Error("Kelompok tidak ditemukan.");
      if (!groupResult[0].isActive) throw new Error("Kelompok tidak aktif.");

      // Validate resident is active
      const residentResult = await tx
        .select()
        .from(residents)
        .where(eq(residents.id, residentId))
        .limit(1);

      if (residentResult.length === 0) throw new Error("Masyarakat tidak ditemukan.");
      if (!residentResult[0].isActive) throw new Error("Masyarakat tidak aktif.");

      // Check active membership
      const existing = await tx
        .select()
        .from(groupMembers)
        .where(
          and(
            eq(groupMembers.residentId, residentId),
            isNull(groupMembers.leftAt)
          )
        )
        .limit(1);

      if (existing.length > 0) throw new Error("Masyarakat sudah memiliki kelompok aktif.");

      const result = await tx
        .insert(groupMembers)
        .values({
          groupId,
          residentId,
          joinedAt: getCurrentLocalDate(),
        })
        .returning();

      return result[0];
    });
  }

  static async moveResidentToGroup(residentId: string, targetGroupId: string) {
    return await db.transaction(async (tx) => {
      // Validate target group is active
      const groupResult = await tx
        .select()
        .from(groups)
        .where(eq(groups.id, targetGroupId))
        .limit(1);

      if (groupResult.length === 0) throw new Error("Kelompok target tidak ditemukan.");
      if (!groupResult[0].isActive) throw new Error("Kelompok target tidak aktif.");

      // Find active membership
      const currentMembership = await tx
        .select()
        .from(groupMembers)
        .where(
          and(
            eq(groupMembers.residentId, residentId),
            isNull(groupMembers.leftAt)
          )
        )
        .limit(1);

      if (currentMembership.length === 0) {
        throw new Error("Masyarakat tidak memiliki kelompok aktif.");
      }

      if (currentMembership[0].groupId === targetGroupId) {
        throw new Error("Masyarakat sudah berada di kelompok tersebut.");
      }

      const currentDate = getCurrentLocalDate();

      // Close old membership
      await tx
        .update(groupMembers)
        .set({ leftAt: currentDate })
        .where(eq(groupMembers.id, currentMembership[0].id));

      // Open new membership
      await tx
        .insert(groupMembers)
        .values({
          groupId: targetGroupId,
          residentId,
          joinedAt: currentDate,
        });

      return true;
    });
  }

  static async removeResidentFromGroup(residentId: string) {
    return await db.transaction(async (tx) => {
      const currentMembership = await tx
        .select()
        .from(groupMembers)
        .where(
          and(
            eq(groupMembers.residentId, residentId),
            isNull(groupMembers.leftAt)
          )
        )
        .limit(1);

      if (currentMembership.length === 0) {
        throw new Error("Masyarakat tidak memiliki kelompok aktif.");
      }

      await tx
        .update(groupMembers)
        .set({ leftAt: getCurrentLocalDate() })
        .where(eq(groupMembers.id, currentMembership[0].id));

      return true;
    });
  }

  static async getResidentMembershipHistory(residentId: string) {
    return await db
      .select({
        membershipId: groupMembers.id,
        groupName: groups.name,
        joinedAt: groupMembers.joinedAt,
        leftAt: groupMembers.leftAt,
      })
      .from(groupMembers)
      .innerJoin(groups, eq(groupMembers.groupId, groups.id))
      .where(eq(groupMembers.residentId, residentId))
      .orderBy(desc(groupMembers.joinedAt));
  }

  static async getResidentActiveGroup(residentId: string) {
    const result = await db
      .select({
        groupId: groups.id,
        groupName: groups.name,
        joinedAt: groupMembers.joinedAt,
      })
      .from(groupMembers)
      .innerJoin(groups, eq(groupMembers.groupId, groups.id))
      .where(
        and(
          eq(groupMembers.residentId, residentId),
          isNull(groupMembers.leftAt)
        )
      )
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  static async reorderGroups(orderedIds: string[]) {
    if (orderedIds.length === 0) return;

    return await db.transaction(async (tx) => {
      // Validate all groups exist
      const existingGroups = await tx
        .select({ id: groups.id })
        .from(groups)
        .where(inArray(groups.id, orderedIds));

      if (existingGroups.length !== orderedIds.length) {
        throw new Error("Beberapa kelompok tidak valid.");
      }

      // Step 1: Set temporary sequence to avoid unique constraint violations
      for (const id of orderedIds) {
        await tx
          .update(groups)
          .set({ sequenceNo: sql`sequence_no + 1000000` })
          .where(eq(groups.id, id));
      }

      // Step 2: Set final sequence
      let seq = 1;
      for (const id of orderedIds) {
        await tx
          .update(groups)
          .set({ sequenceNo: seq })
          .where(eq(groups.id, id));
        seq++;
      }
    });
  }
}
