'use server'

export async function searchCampgrounds(query: string) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return { error: 'Google Maps API key not configured' }
  }

  try {
    // Using Google Places API Text Search
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      query + ' campground'
    )}&key=${apiKey}`

    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      return { error: `Google Places API error: ${data.status}` }
    }

    return { results: data.results || [] }
  } catch (error) {
    console.error('Search error:', error)
    return { error: 'Failed to search campgrounds' }
  }
}

export async function getCampgroundDetails(placeId: string) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return { error: 'Google Maps API key not configured' }
  }

  try {
    // Using Google Places API Place Details
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`

    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== 'OK') {
      return { error: `Google Places API error: ${data.status}` }
    }

    return { result: data.result }
  } catch (error) {
    console.error('Details error:', error)
    return { error: 'Failed to get campground details' }
  }
}
