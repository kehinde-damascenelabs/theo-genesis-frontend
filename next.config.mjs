/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_PLACE_API,
    NEXT_PUBLIC_ELEVEN_MADISON_PARK_PLACE_ID: process.env.ELEVEN_MADISON_PARK_PLACE_ID
  }
};

export default nextConfig;
