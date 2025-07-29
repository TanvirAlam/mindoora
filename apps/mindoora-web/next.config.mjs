/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.mjs");
import pkg from './next-i18next.config.js';

const { i18n } = pkg;

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ["ui"],
  images: {
    domains: [
      "cdn.sanity.io",
      "i.ibb.co",
      "localhost",
      "avatars.githubusercontent.com",
      "www.countryflagicons.com",
      "mindooraserver.mindoora.com",
      "lh3.googleusercontent.com",
      "noimage.com"
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  compiler: {
    styledComponents: true,
  },
  i18n,
  async rewrites() {
    return [
        {
            source: '/robots.txt',
            destination: '/api/robots'
        }
    ];
  },
};
export default config;
