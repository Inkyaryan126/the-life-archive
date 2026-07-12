/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    "/admin/member-cards": ["./assets/fonts/**/*.woff"],
    "/admin/member-cards/[archiveId]/front": ["./assets/fonts/**/*.woff"],
    "/admin/member-cards/[archiveId]/back": ["./assets/fonts/**/*.woff"]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/sign/**"
      }
    ]
  }
};

export default nextConfig;
