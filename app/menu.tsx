import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useStore } from "@/lib/store";
import { CATEGORIES } from "@/lib/constants";

const CATEGORY_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  women: "woman-outline",
  men: "man-outline",
  designer: "diamond-outline",
  kids: "happy-outline",
  home: "home-outline",
  electronics: "phone-portrait-outline",
  beauty: "color-palette-outline",
};

const INFO_LINKS = ["How it works", "Help Centre", "Infoboard"];
const COMPANY_LINKS = ["About us", "Sustainability", "Press", "Advertising"];
const POLICY_LINKS = ["Trust and Safety", "Privacy Centre", "Terms & Conditions"];

export default function Menu() {
  const logout = useStore((s) => s.logout);
  const setFilters = useStore((s) => s.setFilters);

  const goCategory = (key: string) => {
    setFilters({ category: key }); // apply category to the search filters
    router.back(); // close the menu
    router.push("/(tabs)/search");
  };

  const info = (title: string) =>
    Alert.alert(title, "(Demo) This page isn't built out yet.");

  const doLogout = () => {
    logout();
    router.replace("/(auth)/welcome");
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-2">
        <Text className="text-2xl font-extrabold text-primary tracking-tight">Thrifted</Text>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="close" size={28} color="#1A1A1A" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Primary actions */}
        <View className="px-4 pt-2 gap-3">
          <Pressable
            onPress={() => { router.back(); router.push("/(tabs)/sell"); }}
            className="bg-primary rounded-lg py-3.5 active:opacity-80"
          >
            <Text className="text-white font-bold text-center text-base">Sell now</Text>
          </Pressable>
          <Pressable
            onPress={() => { router.back(); router.push("/(tabs)/profile"); }}
            className="border border-primary rounded-lg py-3.5 active:bg-primary-light"
          >
            <Text className="text-primary-dark font-bold text-center text-base">My profile</Text>
          </Pressable>
          <Pressable onPress={() => info("Your guide to Thrifted")} className="py-1">
            <Text className="text-primary-dark font-semibold text-center">Your guide to Thrifted</Text>
          </Pressable>
        </View>

        {/* Categories */}
        <Section title="Categories">
          {CATEGORIES.map((c) => (
            <Row
              key={c.key}
              icon={CATEGORY_ICON[c.key] ?? "pricetag-outline"}
              label={c.label}
              onPress={() => goCategory(c.key)}
              chevron
            />
          ))}
        </Section>

        {/* Info */}
        <Section>
          {INFO_LINKS.map((l) => (
            <Row key={l} label={l} onPress={() => info(l)} />
          ))}
        </Section>

        <Section title="Company">
          {COMPANY_LINKS.map((l) => (
            <Row key={l} label={l} onPress={() => info(l)} />
          ))}
        </Section>

        <Section title="Policies">
          {POLICY_LINKS.map((l) => (
            <Row key={l} label={l} onPress={() => info(l)} />
          ))}
        </Section>

        {/* Log out */}
        <Pressable onPress={doLogout} className="flex-row items-center px-4 py-4 mt-4 active:bg-surface-alt">
          <Ionicons name="log-out-outline" size={22} color="#DC2626" />
          <Text className="text-danger font-semibold ml-3">Log out</Text>
        </Pressable>

        <Text className="text-ink-faint text-center text-xs mt-4">Thrifted v1.0.0 · Demo build</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <View className="mt-6">
      {title && (
        <Text className="text-ink-faint text-xs font-semibold uppercase px-4 mb-1">{title}</Text>
      )}
      {children}
    </View>
  );
}

function Row({
  icon,
  label,
  onPress,
  chevron,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  chevron?: boolean;
}) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center px-4 py-3.5 active:bg-surface-alt">
      {icon && <Ionicons name={icon} size={22} color="#1A1A1A" />}
      <Text className={`text-ink flex-1 ${icon ? "ml-3" : ""}`}>{label}</Text>
      {chevron && <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />}
    </Pressable>
  );
}
