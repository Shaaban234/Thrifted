import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const PRIMARY = "#007782";

// The NayaPurana brand mark: a rounded badge with a "cycle" glyph (new ↔ old,
// the essence of resale). `light` renders it for dark/teal backgrounds.
export function LogoMark({ size = 28, light = false }: { size?: number; light?: boolean }) {
  const badge = Math.round(size * 1.42);
  return (
    <View
      style={{
        width: badge,
        height: badge,
        borderRadius: badge * 0.3,
        backgroundColor: light ? "#FFFFFF" : PRIMARY,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons name="sync" size={size} color={light ? PRIMARY : "#FFFFFF"} />
    </View>
  );
}

// Two-tone "NayaPurana" wordmark. On surface it uses brand + ink (theme-aware);
// on dark/teal backgrounds pass `light`.
export function Wordmark({ size = 22, light = false }: { size?: number; light?: boolean }) {
  const base = { fontSize: size, fontWeight: "800" as const, letterSpacing: -0.5 };
  if (light) {
    return (
      <Text style={base}>
        <Text style={{ color: "#FFFFFF" }}>Naya</Text>
        <Text style={{ color: "rgba(255,255,255,0.72)" }}>Purana</Text>
      </Text>
    );
  }
  return (
    <Text style={base}>
      <Text className="text-primary">Naya</Text>
      <Text className="text-ink">Purana</Text>
    </Text>
  );
}

// Mark + wordmark together. `stack` centers them vertically (splash / welcome);
// default is an inline row for headers.
export function Logo({
  size = 24,
  light = false,
  stack = false,
}: {
  size?: number;
  light?: boolean;
  stack?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: stack ? "column" : "row",
        alignItems: "center",
        gap: stack ? 12 : 8,
      }}
    >
      <LogoMark size={size} light={light} />
      <Wordmark size={stack ? size * 1.7 : size * 1.15} light={light} />
    </View>
  );
}
