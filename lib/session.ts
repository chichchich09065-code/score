export function getAppSession() {
  return {
    user: {
      id: "local-admin",
      email: "admin@score.local",
      name: "Workspace Admin",
      role: "ADMIN" as const,
      positionId: null,
      department: "Engineering",
    },
  };
}
