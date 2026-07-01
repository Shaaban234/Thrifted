import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { LEGAL, type LegalDoc } from "@/lib/legal";

export default function LegalScreen() {
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const content = LEGAL[doc as LegalDoc];

  if (!content) {
    return (
      <SafeAreaView className="flex-1 bg-surface items-center justify-center" edges={["top"]}>
        <Text className="text-ink-muted">Document not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 border-b border-surface-border">
        <Pressable onPress={() => router.back()} hitSlop={8} className="pr-2">
          <Ionicons name="arrow-back" size={24} className="text-ink" />
        </Pressable>
        <Text className="text-lg font-extrabold text-ink flex-1" numberOfLines={1}>{content.title}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        <Text className="text-ink-faint text-xs mb-3">Last updated: {content.updated}</Text>
        <Text className="text-ink-muted leading-6 mb-4">{content.intro}</Text>

        {content.sections.map((s) => (
          <View key={s.heading} className="mt-4">
            <Text className="text-ink font-bold text-base mb-1.5">{s.heading}</Text>
            {s.body.map((p, i) => (
              <Text key={i} className="text-ink-muted leading-6 mb-2">{p}</Text>
            ))}
          </View>
        ))}

        <View className="mt-6 bg-surface-alt rounded-xl p-3 flex-row gap-2">
          <Ionicons name="information-circle-outline" size={16} className="text-ink-faint" />
          <Text className="text-ink-faint text-xs flex-1 leading-5">
            This is a general template drafted around Pakistani law and is provided for information only.
            It is not legal advice — please have it reviewed by a licensed lawyer before you rely on it.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
