const nextConfig = {
    experimental: {
        appDir: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        domains: ["localhost", "ulsan-proto-next.vercel.app"],
        unoptimized: true,
    },
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "Access-Control-Allow-Origin",
                        value: "https://ulsan-proto-next.vercel.app",
                    },
                    {
                        key: "Access-Control-Allow-Methods",
                        value: "GET,POST,OPTIONS",
                    },
                    {
                        key: "Access-Control-Allow-Headers",
                        value: "X-Requested-With, Content-Type",
                    },
                ],
            },
        ]
    },
}

export default nextConfig
