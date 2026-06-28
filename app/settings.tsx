import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useStore } from "@/lib/store";

export default function Settings() {
  const logout = useStore((s) => s.logout);

  const doLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/(auth)/welcome");
        },
      },
    ]);
  };

  const groups: { title: string; rows: { icon: any; label: string }[] }[] = [
    {
      title: "Account",
      rows: [
        { icon: "person-outline", label: "Edit profile" },
        { icon: "card-outline", label: "Payment methods" },
        { icon: "location-outline", label: "Shipping addresses" },
        { icon: "notifications-outline", label: "Notifications" },
      ],
    },
    {
      title: "Shopping",
      rows: [
        { icon: "bag-handle-outline", label: "My purchases" },
        { icon: "pricetag-outline", label: "My listings" },
        { icon: "star-outline", label: "My reviews" },
      ],
    },
    {
      title: "Support",
      rows: [
        { icon: "shield-checkmark-outline", label: "Buyer Protection" },
        { icon: "help-circle-outline", label: "Help centre" },
        { icon: "document-text-outline", label: "Terms & Privacy" },
      ],
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 border-b border-surface-border">
        <Pressable onPress={() => router.back()} hitSlop={8} className="pr-2">
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </Pressable>
        <Text className="text-lg font-extrabold text-ink">Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {groups.map((group) => (
          <View key={group.title} className="mt-5">
            <Text className="text-ink-muted text-xs font-semibold uppercase px-4 mb-1">
              {group.title}
            </Text>
            {group.rows.map((row) => (
              <Pressable
                key={row.label}
                onPress={() => Alert.alert(row.label, "(Demo) This screen isn't built out yet.")}
                className="flex-row items-center px-4 py-3.5 active:bg-surface-alt"
              >
                <Ionicons name={row.icon} size={22} color="#1A1A1A" />
                <Text className="text-ink flex-1 ml-3">{row.label}</Text>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </Pressable>
            ))}
          </View>
        ))}

        <Pressable onPress={doLogout} className="flex-row items-center px-4 py-4 mt-6 active:bg-surface-alt">
          <Ionicons name="log-out-outline" size={22} color="#DC2626" />
          <Text className="text-danger font-semibold ml-3">Log out</Text>
        </Pressable>

        <Text className="text-ink-faint text-center text-xs my-6">Thrifted v1.0.0 · Demo build</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
