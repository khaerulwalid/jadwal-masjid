export type RotationGroup = {
  id: string;
  name: string;
  sequenceNo: number;
};

/**
 * Returns the next group in the rotation given the current group and an ordered list of active groups.
 */
export function getNextActiveGroup(
  currentGroupId: string,
  activeGroupsOrdered: RotationGroup[]
): RotationGroup {
  if (activeGroupsOrdered.length === 0) {
    throw new Error("Tidak ada kelompok aktif.");
  }

  const currentIndex = activeGroupsOrdered.findIndex(
    (g) => g.id === currentGroupId
  );

  if (currentIndex === -1) {
    throw new Error("Kelompok tidak ditemukan di dalam daftar kelompok aktif.");
  }

  // Wrap around to the first group if we're at the end
  const nextIndex = (currentIndex + 1) % activeGroupsOrdered.length;
  return activeGroupsOrdered[nextIndex];
}

/**
 * Returns an array of the next `count` groups starting from `startGroupId`.
 * Note: The sequence INCLUDES the startGroupId as the first item.
 */
export function getNextGroups(
  startGroupId: string,
  activeGroupsOrdered: RotationGroup[],
  count: number
): RotationGroup[] {
  if (activeGroupsOrdered.length === 0) {
    throw new Error("Tidak ada kelompok aktif.");
  }

  if (count <= 0) {
    return [];
  }

  const startIndex = activeGroupsOrdered.findIndex(
    (g) => g.id === startGroupId
  );

  if (startIndex === -1) {
    throw new Error("Kelompok awal tidak ditemukan di dalam daftar kelompok aktif.");
  }

  const result: RotationGroup[] = [];
  const len = activeGroupsOrdered.length;

  for (let i = 0; i < count; i++) {
    result.push(activeGroupsOrdered[(startIndex + i) % len]);
  }

  return result;
}
