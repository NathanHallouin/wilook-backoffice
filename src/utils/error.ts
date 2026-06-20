/**
 * Extracts a human-readable message from an unknown thrown value.
 *
 * Services throw `Error` instances carrying the underlying Supabase/network
 * detail (e.g. "Failed to delete product: violates foreign key constraint …").
 * Surfacing that beats a blanket "Une erreur est survenue", while `fallback`
 * keeps a sensible default when no message is available.
 */
export function getErrorMessage(error: unknown, fallback = 'Une erreur est survenue'): string {
  if (error instanceof Error && error.message.trim()) return error.message
  if (typeof error === 'string' && error.trim()) return error
  return fallback
}
