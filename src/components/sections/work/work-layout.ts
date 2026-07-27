export type WorkLayoutRole = "LEAD" | "PORTRAIT" | "WIDE" | "STANDARD";

/**
 * Deterministic layout roles from project count (and optional video preference).
 * Does not leave empty grid holes for 0–5+ counts.
 */
export function assignWorkLayoutRoles(
  count: number,
  options?: { preferWideIndexes?: number[] }
): WorkLayoutRole[] {
  if (count <= 0) return [];
  if (count === 1) return ["LEAD"];
  if (count === 2) return ["LEAD", "STANDARD"];
  if (count === 3) return ["LEAD", "PORTRAIT", "PORTRAIT"];
  if (count === 4) return ["LEAD", "PORTRAIT", "PORTRAIT", "WIDE"];

  const roles: WorkLayoutRole[] = [
    "LEAD",
    "PORTRAIT",
    "PORTRAIT",
    "WIDE",
    "STANDARD",
  ];
  while (roles.length < count) {
    roles.push("STANDARD");
  }

  const preferWide = options?.preferWideIndexes ?? [];
  for (const index of preferWide) {
    if (index > 0 && index < roles.length && roles[index] === "STANDARD") {
      const wideIndex = roles.indexOf("WIDE");
      if (wideIndex >= 0 && wideIndex !== index) {
        roles[wideIndex] = "STANDARD";
        roles[index] = "WIDE";
      }
    }
  }

  return roles;
}

export function workRoleClassName(role: WorkLayoutRole): string {
  switch (role) {
    case "LEAD":
      return "md:col-span-2 md:row-span-2 min-h-[280px] md:min-h-[420px]";
    case "PORTRAIT":
      return "md:col-span-1 min-h-[260px] md:min-h-[320px]";
    case "WIDE":
      return "md:col-span-2 min-h-[220px] md:min-h-[260px]";
    case "STANDARD":
    default:
      return "md:col-span-1 min-h-[220px] md:min-h-[240px]";
  }
}
