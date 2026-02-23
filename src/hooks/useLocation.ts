'use client';

import { useState, useCallback, useEffect } from 'react';
import { UserLocation } from '@/types';

const LOCATION_STORAGE_KEY = 'repairiq_user_location';

interface UseLocationResult {
  location: UserLocation | null;
  isLoading: boolean;
  error: string | null;
  permissionStatus: PermissionState | null;
  requestLocation: () => Promise<void>;
  setManualZipCode: (zipCode: string) => Promise<void>;
  clearLocation: () => void;
}

// Get stored location from localStorage
function getStoredLocation(): UserLocation | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Check if location is less than 24 hours old
      if (parsed.timestamp && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
        return parsed.location;
      }
    }
  } catch {
    // Ignore errors
  }
  return null;
}

// Store location in localStorage
function storeLocation(location: UserLocation): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify({
      location,
      timestamp: Date.now(),
    }));
  } catch {
    // Ignore errors
  }
}

// Reverse geocode coordinates to get city/state/zip
async function reverseGeocode(lat: number, lng: number): Promise<Partial<UserLocation>> {
  try {
    // Use OpenStreetMap Nominatim (free, no API key required)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'RepairIQ/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json();
    const address = data.address || {};

    return {
      city: address.city || address.town || address.village || address.municipality,
      state: address.state,
      zipCode: address.postcode,
      country: address.country,
    };
  } catch (error) {
    console.warn('Reverse geocoding failed:', error);
    return {};
  }
}

// Forward geocode zip code to coordinates
async function geocodeZipCode(zipCode: string): Promise<UserLocation | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${zipCode}&country=USA&format=json&addressdetails=1&limit=1`,
      {
        headers: {
          'User-Agent': 'RepairIQ/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json();

    if (data.length === 0) {
      throw new Error('Zip code not found');
    }

    const result = data[0];
    const address = result.address || {};

    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      city: address.city || address.town || address.village,
      state: address.state,
      zipCode: zipCode,
      country: address.country || 'United States',
    };
  } catch (error) {
    console.warn('Zip code geocoding failed:', error);
    return null;
  }
}

export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | null>(null);

  // Load stored location on mount
  useEffect(() => {
    const stored = getStoredLocation();
    if (stored) {
      setLocation(stored);
    }
  }, []);

  // Check permission status
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.permissions) return;

    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      setPermissionStatus(result.state);
      result.onchange = () => {
        setPermissionStatus(result.state);
      };
    }).catch(() => {
      // Permissions API not supported
    });
  }, []);

  const requestLocation = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;

      // Reverse geocode to get city/state/zip
      const geoData = await reverseGeocode(latitude, longitude);

      const newLocation: UserLocation = {
        latitude,
        longitude,
        ...geoData,
      };

      setLocation(newLocation);
      storeLocation(newLocation);
      setPermissionStatus('granted');
    } catch (err) {
      const geoError = err as GeolocationPositionError;
      switch (geoError.code) {
        case geoError.PERMISSION_DENIED:
          setError('Location permission denied. Please enter your zip code manually.');
          setPermissionStatus('denied');
          break;
        case geoError.POSITION_UNAVAILABLE:
          setError('Location unavailable. Please enter your zip code manually.');
          break;
        case geoError.TIMEOUT:
          setError('Location request timed out. Please enter your zip code manually.');
          break;
        default:
          setError('Unable to get location. Please enter your zip code manually.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setManualZipCode = useCallback(async (zipCode: string) => {
    if (!zipCode || zipCode.length < 5) {
      setError('Please enter a valid 5-digit zip code');
      return;
    }

    setIsLoading(true);
    setError(null);

    const newLocation = await geocodeZipCode(zipCode);

    if (newLocation) {
      setLocation(newLocation);
      storeLocation(newLocation);
    } else {
      setError('Invalid zip code. Please try again.');
    }

    setIsLoading(false);
  }, []);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setError(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCATION_STORAGE_KEY);
    }
  }, []);

  return {
    location,
    isLoading,
    error,
    permissionStatus,
    requestLocation,
    setManualZipCode,
    clearLocation,
  };
}

export default useLocation;
