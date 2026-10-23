// Allow plain HTTP only on loopback hosts during local development.
export function sessionCookieOptions(host: string) {
  const hostname = host.startsWith("[") ? host.slice(0, host.indexOf("]") + 1) : host.split(":")[0];
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(hostname.toLowerCase());
  return {
    name: local ? "diary-session-local" : "__Host-diary-session",
    attributes: `Path=/; HttpOnly; ${local ? "" : "Secure; "}SameSite=Strict`,
  };
}
