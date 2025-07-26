// utils/geolocation.js
import axios from 'axios';

/**
 * Attempts to detect the user's city by GPS with a reverse-geocode and geographic fallback.
 * Returns one of the validCities or null if not in the service area or on failure.
 */
export const detectCityByGeo = async () => {
  const validCities = [
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
    'Peshawar', 'Quetta', 'Multan', 'Hyderabad', 'Sialkot',
    'Gujranwala', 'Sargodha', 'Bahawalpur'
  ];

  // Promise-wrap getCurrentPosition
  const { latitude, longitude } = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      pos => resolve(pos.coords),
      err => {
        const codes = { 1:'PERMISSION_DENIED', 2:'POSITION_UNAVAILABLE', 3:'TIMEOUT' };
        reject(new Error(codes[err.code] || 'UNKNOWN_ERROR'));
      },
      { enableHighAccuracy:true, timeout:10000, maximumAge:0 }
    );
  });

  // Try reverse-geocoding but DON'T abort on failure
  let address = null;
  try {
    const res = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: { lat: latitude, lon: longitude, format:'json', addressdetails:1 }
    });
    address = res.data.address;
  } catch (_err) {
    console.warn('Reverse-geocode failed, falling back to distance');
  }

  // 1) If we got an address, try county/text/district matches
  if (address) {
    const countyMatch = validCities.find(c =>
      address.county?.toLowerCase().includes(c.toLowerCase())
    );
    if (countyMatch) {
      return countyMatch;
    }

    if (address.state_district) {
      const divMatch = validCities.find(c =>
        address.state_district.toLowerCase().includes(c.toLowerCase())
      );
      if (divMatch) {
        return divMatch;
      }
    }

    const fields = [address.city, address.town, address.village, address.municipality, address.state];
    const textMatch = validCities.find(c =>
      fields.some(f => f?.toLowerCase().includes(c.toLowerCase()))
    );
    if (textMatch) {
      return textMatch;
    }
  }

  // 2) Fallback: nearest by Haversine
  let nearest = null;
  let minDist = Infinity;
  for (const [city, { lat, lon }] of Object.entries(cityCoords)) {
    const d = haversine(latitude, longitude, lat, lon);
    if (d < minDist) {
      minDist = d;
      nearest = city;
    }
  }
  console.log("city detected: ", nearest);

  return nearest;
};

