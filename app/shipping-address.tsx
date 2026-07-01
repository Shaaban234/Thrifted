import { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Button } from "@/components/Button";
import { useStore } from "@/lib/store";

export default function ShippingAddress() {
  const currentUserId = useStore((s) => s.currentUserId);
  const user = useStore((s) => s.getUser(currentUserId));
  const updateProfile = useStore((s) => s.updateProfile);

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [addressLine1, setAddressLine1] = useState(user?.addressLine1 ?? "");
  const [addressLine2, setAddressLine2] = useState(user?.addressLine2 ?? "");
  const [city, setCity] = useState(user?.city ?? "");
  const [postalCode, setPostalCode] = useState(user?.postalCode ?? "");
  const [country, setCountry] = useState(user?.country ?? "");
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const save = async () => {
    if (!fullName.trim() || !addressLine1.trim() || !city.trim()) {
      Alert.alert("Almost there", "Please add at least a name, street address and city.");
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim(),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        country: country.trim(),
      });
      router.back();
    } catch (e: any) {
      Alert.alert("Couldn't save", e?.message ?? "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 border-b border-surface-border">
        <Pressable onPress={() => router.back()} hitSlop={8} className="pr-2">
          <Ionicons name="arrow-back" size={24} className="text-ink" />
        </Pressable>
        <Text className="text-lg font-extrabold text-ink">Shipping address</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Field label="Full name" value={fullName} onChangeText={setFullName} placeholder="Jane Doe" />
        <Field label="Phone" value={phone} onChangeText={setPhone} placeholder="+92 300 1234567" keyboardType="phone-pad" />
        <Field label="Address line 1" value={addressLine1} onChangeText={setAddressLine1} placeholder="Street and house number" />
        <Field label="Address line 2" value={addressLine2} onChangeText={setAddressLine2} placeholder="Apartment, suite (optional)" />
        <Field label="City" value={city} onChangeText={setCity} placeholder="City" />
        <Field label="Postal code" value={postalCode} onChangeText={setPostalCode} placeholder="Postal / ZIP code" />
        <Field label="Country" value={country} onChangeText={setCountry} placeholder="Country" />

        <View className="px-4 mt-6">
          <Button label={saving ? "Saving…" : "Save address"} onPress={save} loading={saving} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View className="px-4 mt-4">
      <Text className="text-ink-muted text-xs font-semibold uppercase mb-1.5">{label}</Text>
      <TextInput
        placeholderTextColor="#9CA3AF"
        className="bg-surface-alt rounded-xl px-4 py-3.5 text-ink text-base"
        {...props}
      />
    </View>
  );
}
