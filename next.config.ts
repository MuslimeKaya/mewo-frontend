import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {
                source: '/hub',
                destination: '/',
            },
            {
                source: '/hub/:path*',
                destination: '/',
            },
            {
                source: '/dashboard',
                destination: '/',
            },
            {
                source: '/roadmap',
                destination: '/',
            },
            {
                source: '/pathway', // Alias for roadmap just in case
                destination: '/',
            },
            {
                source: '/tutor',
                destination: '/',
            },
            {
                source: '/library',
                destination: '/',
            },
            {
                source: '/students',
                destination: '/',
            },
            {
                source: '/students/:path*',
                destination: '/',
            },
            {
                source: '/teachers',
                destination: '/',
            },
            {
                source: '/grammar',
                destination: '/',
            },
            {
                source: '/grammar/:path*',
                destination: '/',
            },
            {
                source: '/settings',
                destination: '/',
            }
        ];
    },
};

export default nextConfig;
