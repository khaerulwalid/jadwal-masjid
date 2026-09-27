import { db } from "@/db";
import { groups, rotationState } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export class RotationService {
  static async getActiveGroupsOrdered() {
    return await db
      .select({
        id: groups.id,
        name: groups.name,
        sequenceNo: groups.sequenceNo,
      })
      .from(groups)
      .where(eq(groups.isActive, true))
      .orderBy(asc(groups.sequenceNo));
  }

  static async getRotationState() {
    // There should only be one row with id = 1
    const result = await db
      .select()
      .from(rotationState)
      .where(eq(rotationState.id, 1))
      .limit(1);

    if (result.length === 0) {
      // Return default state if somehow missing
      return {
        isPaused: false,
        nextGroup: null,
      };
    }

    const state = result[0];
    let nextGroup = null;

    if (state.nextGroupId) {
      const groupResult = await db
        .select({
          id: groups.id,
          name: groups.name,
          sequenceNo: groups.sequenceNo,
          isActive: groups.isActive,
        })
        .from(groups)
        .where(eq(groups.id, state.nextGroupId))
        .limit(1);

      if (groupResult.length > 0) {
        nextGroup = groupResult[0];
      }
    }

    return {
      isPaused: state.isPaused,
      nextGroup,
    };
  }

  static async setNextGroup(groupId: string) {
    const groupResult = await db
      .select()
      .from(groups)
      .where(eq(groups.id, groupId))
      .limit(1);

    if (groupResult.length === 0) {
      throw new Error("Kelompok tidak ditemukan.");
    }

    if (!groupResult[0].isActive) {
      throw new Error("Kelompok yang dipilih sudah tidak aktif.");
    }

    // Upsert rotation state (usually id=1 exists, but just in case)
    const existingState = await db.select().from(rotationState).where(eq(rotationState.id, 1)).limit(1);
    
    if (existingState.length === 0) {
      await db.insert(rotationState).values({
        id: 1,
        nextGroupId: groupId,
      });
    } else {
      await db.update(rotationState)
        .set({
          nextGroupId: groupId,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(rotationState.id, 1));
    }
  }

  static async pauseRotation() {
    const existingState = await db.select().from(rotationState).where(eq(rotationState.id, 1)).limit(1);
    
    if (existingState.length === 0) {
      await db.insert(rotationState).values({
        id: 1,
        isPaused: true,
      });
    } else {
      await db.update(rotationState)
        .set({
          isPaused: true,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(rotationState.id, 1));
    }
  }

  static async resumeRotation(nextGroupId?: string) {
    if (nextGroupId) {
      // Validate the override group
      const groupResult = await db
        .select()
        .from(groups)
        .where(eq(groups.id, nextGroupId))
        .limit(1);

      if (groupResult.length === 0) {
        throw new Error("Kelompok tidak ditemukan.");
      }

      if (!groupResult[0].isActive) {
        throw new Error("Kelompok yang dipilih sudah tidak aktif.");
      }
    }

    const existingState = await db.select().from(rotationState).where(eq(rotationState.id, 1)).limit(1);
    
    if (existingState.length === 0) {
      if (!nextGroupId) {
        throw new Error("Tentukan kelompok berikutnya sebelum melanjutkan rotasi.");
      }
      await db.insert(rotationState).values({
        id: 1,
        isPaused: false,
        nextGroupId,
      });
    } else {
      if (!nextGroupId && !existingState[0].nextGroupId) {
        throw new Error("Tentukan kelompok berikutnya sebelum melanjutkan rotasi.");
      }

      const updates: { isPaused: boolean; updatedAt: string; nextGroupId?: string } = {
        isPaused: false,
        updatedAt: new Date().toISOString(),
      };
      
      if (nextGroupId) {
        updates.nextGroupId = nextGroupId;
      }

      await db.update(rotationState)
        .set(updates)
        .where(eq(rotationState.id, 1));
    }
  }
}
