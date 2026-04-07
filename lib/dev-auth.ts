export const isDevAuthBypassEnabled = process.env.DEV_AUTH_BYPASS === "true";

export function getDevSession() {
  if (!isDevAuthBypassEnabled) {
    return null;
  }

  return {
    user: {
      id: "dev-admin",
      email: "admin@score.local",
      name: "Dev Admin",
      role: "ADMIN" as const,
      positionId: null,
      department: "Engineering",
    },
  };
}
