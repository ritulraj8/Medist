module.exports = {
    reactStrictMode: true,
    images: {
        domains: ['www.gstatic.com'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    webpack: (config) => {
        // MongoDB requires these Node.js modules but they're not used on the client side
        config.resolve.fallback = {
            ...config.resolve.fallback,
            net: false,
            tls: false,
            fs: false,
            dns: false,
            child_process: false,
            aws4: false,
        };
        
        return config;
    },
}