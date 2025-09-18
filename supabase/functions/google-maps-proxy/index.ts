import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const GOOGLE_MAPS_API_KEY = "AIzaSyBZlJtstGEj9wCMP5_O5PaGytIi-iForN0"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { lat, lng, type = 'geocode' } = await req.json()

    if (!lat || !lng) {
      return new Response(
        JSON.stringify({ error: 'Latitude and longitude are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let apiUrl = ''
    let responseData: any = {}

    if (type === 'geocode') {
      // Reverse geocoding to get location name
      apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
      
      const geocodeResponse = await fetch(apiUrl)
      const geocodeData = await geocodeResponse.json()
      
      if (geocodeData.results && geocodeData.results.length > 0) {
        const address = geocodeData.results[0]
        const locationComponents = address.address_components
        
        // Extract meaningful location name
        const locality = locationComponents.find((c: any) => c.types.includes('locality'))?.long_name
        const sublocality = locationComponents.find((c: any) => c.types.includes('sublocality'))?.long_name
        const adminArea = locationComponents.find((c: any) => c.types.includes('administrative_area_level_2'))?.long_name
        const state = locationComponents.find((c: any) => c.types.includes('administrative_area_level_1'))?.long_name
        
        const locationName = [sublocality, locality, adminArea, state].filter(Boolean).join(', ')
        
        responseData = {
          locationName: locationName || address.formatted_address,
          fullAddress: address.formatted_address,
          components: locationComponents
        }
      } else {
        responseData = {
          locationName: 'Unknown Location',
          fullAddress: 'Address not found',
          components: []
        }
      }
    } else if (type === 'places') {
      // Nearby places search
      apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=point_of_interest&key=${GOOGLE_MAPS_API_KEY}`
      
      const placesResponse = await fetch(apiUrl)
      const placesData = await placesResponse.json()
      
      if (placesData.results) {
        const landmarks = placesData.results
          .slice(0, 5) // Top 5 landmarks
          .map((place: any) => {
            const distance = calculateDistance(
              lat, 
              lng, 
              place.geometry.location.lat, 
              place.geometry.location.lng
            )
            
            return {
              name: place.name,
              distance: distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`,
              type: place.types[0]?.replace(/_/g, ' ') || 'landmark',
              rating: place.rating,
              vicinity: place.vicinity
            }
          })
        
        responseData = {
          landmarks
        }
      } else {
        responseData = {
          landmarks: []
        }
      }
    } else if (type === 'both') {
      // Get both geocode and places data
      const [geocodeResponse, placesResponse] = await Promise.all([
        fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`),
        fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=point_of_interest&key=${GOOGLE_MAPS_API_KEY}`)
      ])

      const geocodeData = await geocodeResponse.json()
      const placesData = await placesResponse.json()

      // Process geocode data
      let locationName = 'Unknown Location'
      if (geocodeData.results && geocodeData.results.length > 0) {
        const address = geocodeData.results[0]
        const locationComponents = address.address_components
        
        const locality = locationComponents.find((c: any) => c.types.includes('locality'))?.long_name
        const sublocality = locationComponents.find((c: any) => c.types.includes('sublocality'))?.long_name
        const adminArea = locationComponents.find((c: any) => c.types.includes('administrative_area_level_2'))?.long_name
        const state = locationComponents.find((c: any) => c.types.includes('administrative_area_level_1'))?.long_name
        
        locationName = [sublocality, locality, adminArea, state].filter(Boolean).join(', ') || address.formatted_address
      }

      // Process places data
      const landmarks = placesData.results ? placesData.results
        .slice(0, 5)
        .map((place: any) => {
          const distance = calculateDistance(
            lat, 
            lng, 
            place.geometry.location.lat, 
            place.geometry.location.lng
          )
          
          return {
            name: place.name,
            distance: distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`,
            type: place.types[0]?.replace(/_/g, ' ') || 'landmark',
            rating: place.rating,
            vicinity: place.vicinity
          }
        }) : []

      responseData = {
        locationName,
        landmarks
      }
    }

    return new Response(
      JSON.stringify(responseData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Google Maps API proxy error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch location data' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Calculate distance between two points in kilometers
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}
