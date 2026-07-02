/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // react-pdf / pdfjs-dist reference the optional 'canvas' package (Node-only)
    config.resolve.alias.canvas = false;
    return config;
  },
};

module.exports = nextConfig;
