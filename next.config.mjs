/** @type {import('next').NextConfig} */
const nextConfig = {
    // Skip type checking and linting during build if env vars aren't set
    // This allows building without Supabase configured
    typescript: {
        ignoreBuildErrors: process.env.SKIP_TYPE_CHECK === 'true',
    },
    eslint: {
        ignoreDuringBuilds: process.env.SKIP_LINT === 'true',
    },
    images: {
        // Allow data URLs for QR code images
        remotePatterns: [],
        dangerouslyAllowSVG: true,
    },
};

export default nextConfig;
