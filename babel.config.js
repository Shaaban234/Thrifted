module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // Note: the reanimated plugin is added by nativewind/babel (via
    // react-native-css-interop). Do not add it here too — that would duplicate it.
  };
};
