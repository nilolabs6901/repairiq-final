import { NextResponse } from 'next/server';
import { LocalProfessional, ServiceCategory } from '@/types';

// Map service categories to Google Places search terms
const CATEGORY_TO_SEARCH_TERMS: Record<ServiceCategory, string[]> = {
  appliance_repair: ['appliance repair', 'appliance service'],
  plumber: ['plumber', 'plumbing service'],
  electrician: ['electrician', 'electrical contractor'],
  hvac: ['hvac', 'air conditioning repair', 'heating repair'],
  garage_door: ['garage door repair', 'garage door service'],
  handyman: ['handyman', 'home repair'],
  general_contractor: ['general contractor', 'home improvement'],
};

// Helper to calculate distance in miles between two coordinates
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Format distance for display
function formatDistance(miles: number): string {
  if (miles < 0.1) return 'Less than 0.1 mi';
  if (miles < 1) return `${miles.toFixed(1)} mi`;
  return `${Math.round(miles)} mi`;
}

interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  opening_hours?: {
    open_now?: boolean;
    weekday_text?: string[];
  };
  price_level?: number;
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  types?: string[];
  business_status?: string;
}

// Fetch professionals from Google Places API
async function fetchFromGooglePlaces(
  latitude: number,
  longitude: number,
  category: ServiceCategory,
  apiKey: string
): Promise<LocalProfessional[]> {
  const searchTerms = CATEGORY_TO_SEARCH_TERMS[category] || ['home repair'];
  const results: LocalProfessional[] = [];
  const seenPlaceIds = new Set<string>();

  for (const searchTerm of searchTerms) {
    try {
      // Use Places API Text Search (supports keyword search)
      const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
      searchUrl.searchParams.set('query', searchTerm);
      searchUrl.searchParams.set('location', `${latitude},${longitude}`);
      searchUrl.searchParams.set('radius', '40233'); // 25 miles in meters
      searchUrl.searchParams.set('type', 'establishment');
      searchUrl.searchParams.set('key', apiKey);

      const searchResponse = await fetch(searchUrl.toString());
      const searchData = await searchResponse.json();

      if (searchData.status !== 'OK' && searchData.status !== 'ZERO_RESULTS') {
        console.warn(`Google Places API error: ${searchData.status}`, searchData.error_message);
        continue;
      }

      const places: GooglePlaceResult[] = searchData.results || [];

      for (const place of places.slice(0, 5)) {
        // Skip if we've already seen this place
        if (seenPlaceIds.has(place.place_id)) continue;
        seenPlaceIds.add(place.place_id);

        // Skip if no rating
        if (!place.rating || place.rating < 3.5) continue;

        const distance = calculateDistance(
          latitude,
          longitude,
          place.geometry.location.lat,
          place.geometry.location.lng
        );

        // Skip if too far (more than 30 miles)
        if (distance > 30) continue;

        // Parse address
        const addressParts = (place.formatted_address || '').split(', ');
        const city = addressParts[1] || '';
        const stateZip = addressParts[2] || '';
        const [state, zipCode] = stateZip.split(' ');

        // Get photo URL if available
        let photoUrl: string | undefined;
        if (place.photos && place.photos.length > 0) {
          const photoRef = place.photos[0].photo_reference;
          photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=200&photo_reference=${photoRef}&key=${apiKey}`;
        }

        results.push({
          id: place.place_id,
          name: place.name,
          businessName: place.name,
          specialty: [searchTerm],
          rating: place.rating || 0,
          reviewCount: place.user_ratings_total || 0,
          phone: place.formatted_phone_number,
          website: place.website,
          address: addressParts[0] || place.formatted_address || '',
          city,
          state: state || '',
          zipCode: zipCode || '',
          distance,
          distanceText: formatDistance(distance),
          priceLevel: place.price_level as 1 | 2 | 3 | 4 | undefined,
          isOpen: place.opening_hours?.open_now,
          photoUrl,
          googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
          placeId: place.place_id,
          categories: place.types || [],
        });
      }

      // Limit to 5 results per category
      if (results.length >= 5) break;
    } catch (error) {
      console.error(`Error fetching from Google Places for ${searchTerm}:`, error);
    }
  }

  // Sort by rating and distance
  return results
    .sort((a, b) => {
      // Prioritize rating, then distance
      const ratingDiff = b.rating - a.rating;
      if (Math.abs(ratingDiff) > 0.3) return ratingDiff;
      return a.distance - b.distance;
    })
    .slice(0, 5);
}

// Generate mock data for demo/fallback
function generateMockProfessionals(
  latitude: number,
  longitude: number,
  category: ServiceCategory
): LocalProfessional[] {
  const categoryNames: Record<ServiceCategory, string[]> = {
    appliance_repair: ['AppliancePro Services', 'Quick Fix Appliance', 'Home Appliance Experts', 'Reliable Repair Co', 'A+ Appliance Service'],
    plumber: ['Premier Plumbing', 'FastFlow Plumbers', 'DrainMaster Plumbing', 'Ace Plumbing Services', 'H2O Plumbing Pros'],
    electrician: ['BrightSpark Electric', 'PowerUp Electrical', 'SafeWire Electricians', 'Current Electric Co', 'Lightning Fast Electric'],
    hvac: ['CoolBreeze HVAC', 'Climate Control Pros', 'AirComfort Systems', 'TempMaster HVAC', 'All Seasons Heating & Air'],
    garage_door: ['Garage Door Masters', 'LiftRight Door Service', 'Quick Open Garage Doors', 'Precision Garage Repairs', 'DoorTech Services'],
    handyman: ['Handy Home Services', 'Mr. Fix-It Pro', 'All-Around Handyman', 'Home Helper Services', 'Jack of All Repairs'],
    general_contractor: ['BuildRight Contractors', 'HomePro Improvements', 'Quality Construction Co', 'Master Builders Inc', 'Premier Home Services'],
  };

  const names = categoryNames[category] || categoryNames.handyman;
  const specialties = CATEGORY_TO_SEARCH_TERMS[category] || ['home repair'];

  return names.map((name, index) => {
    const distance = 1 + index * 3 + Math.random() * 2;
    return {
      id: `mock-${category}-${index}`,
      name,
      businessName: name,
      specialty: specialties,
      rating: 4.2 + Math.random() * 0.8,
      reviewCount: 20 + Math.floor(Math.random() * 180),
      phone: `(555) ${100 + index * 111}-${1000 + index * 1111}`,
      website: `https://example.com/${name.toLowerCase().replace(/\s+/g, '-')}`,
      address: `${1000 + index * 100} Main Street`,
      city: 'Your City',
      state: 'ST',
      zipCode: '12345',
      distance,
      distanceText: formatDistance(distance),
      priceLevel: ((index % 3) + 1) as 1 | 2 | 3 | 4,
      isOpen: Math.random() > 0.3,
      categories: [category],
    };
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { latitude, longitude, category, zipCode } = body as {
      latitude?: number;
      longitude?: number;
      category?: ServiceCategory;
      zipCode?: string;
    };

    // Validate inputs
    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }

    let lat = latitude;
    let lng = longitude;

    // If no coordinates but have zip code, geocode it
    if ((!lat || !lng) && zipCode) {
      try {
        const geoResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?postalcode=${zipCode}&country=USA&format=json&limit=1`,
          { headers: { 'User-Agent': 'RepairIQ/1.0' } }
        );
        const geoData = await geoResponse.json();
        if (geoData.length > 0) {
          lat = parseFloat(geoData[0].lat);
          lng = parseFloat(geoData[0].lon);
        }
      } catch (error) {
        console.warn('Zip code geocoding failed:', error);
      }
    }

    // Default to a central US location if no coordinates
    if (!lat || !lng) {
      lat = 39.8283;
      lng = -98.5795;
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    let professionals: LocalProfessional[];

    if (apiKey) {
      // Try Google Places API
      professionals = await fetchFromGooglePlaces(lat, lng, category, apiKey);

      // Fall back to mock data if no results
      if (professionals.length === 0) {
        console.log('No Google Places results, using mock data');
        professionals = generateMockProfessionals(lat, lng, category);
      }
    } else {
      // No API key, use mock data
      console.log('No Google Places API key, using mock data');
      professionals = generateMockProfessionals(lat, lng, category);
    }

    return NextResponse.json({
      professionals,
      source: apiKey && professionals[0]?.placeId ? 'google_places' : 'mock',
      count: professionals.length,
    });
  } catch (error) {
    console.error('Professionals API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch professionals' },
      { status: 500 }
    );
  }
}
