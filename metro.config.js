const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = withNativeWind(getDefaultConfig(__dirname), { input: "./global.css" });

// Resolve the "@/..." path alias explicitly. Expo can infer this from tsconfig
// `paths`, but that inference didn't fire in the Vercel (Linux) build, so we map it
// here to guarantee identical resolution everywhere.
const upstreamResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const resolve = upstreamResolveRequest ?? context.resolveRequest;
  if (moduleName === "@" || moduleName.startsWith("@/")) {
    const target = path.resolve(__dirname, moduleName.replace(/^@\/?/, ""));
    return resolve(context, target, platform);
  }
  return resolve(context, moduleName, platform);
};

module.exports = config;
