/**
 * Parses a Google Places address string and returns "City, ST" or null.
 * Handles both vicinity ("Street, City, State") and formatted_address
 * ("Name, Street, City, ST 12345, USA") formats.
 */
export function parseCityState(address: string | null | undefined): string | null {
  if (!address) return null

  const parts = address.split(', ').map((p) => p.trim())

  // Look for a segment matching "ST 12345" (state + zip)
  const stateZipIndex = parts.findIndex((p) => /^[A-Z]{2} \d{5}/.test(p))
  if (stateZipIndex > 0) {
    const city = parts[stateZipIndex - 1]
    const state = parts[stateZipIndex].split(' ')[0]
    if (city && state) return `${city}, ${state}`
  }

  // Fallback: look for segment just before "USA"
  const usaIndex = parts.findIndex((p) => p === 'USA')
  if (usaIndex >= 2) {
    const city = parts[usaIndex - 2]
    const stateZip = parts[usaIndex - 1]
    const state = stateZip?.split(' ')[0]
    if (city && state && /^[A-Z]{2}$/.test(state)) return `${city}, ${state}`
  }

  return null
}
