/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    domains: ["lh3.googleusercontent.com"], // For Google profile images
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};
