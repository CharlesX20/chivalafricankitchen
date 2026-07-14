export function isAdmin(email: string | undefined): boolean {
  if (!email) return false
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
  return adminEmails.includes(email.trim())
}

export function getAdminEmails(): string[] {
  return process.env.ADMIN_EMAILS?.split(',') || []
}