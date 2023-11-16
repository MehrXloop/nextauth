/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode:true,
    swcMinify:true,
    optimizeFonts:true,
    images:{
        remotePatterns:[
            {
                protocol:"https",
                hostname:"platform-lookaside.fbsbx.com"
            },
            {
                protocol:"https",
                hostname:"lh3.googleusercontent.com"
            },
            {
                protocol:"https",
                hostname:"media.licdn.com"
            }
        ]
    }
}

module.exports = nextConfig
