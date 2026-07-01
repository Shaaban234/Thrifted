import { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { useStore } from "@/lib/store";
import { preparePhoto } from "@/lib/photos";

export default function EditProfile() {
  const currentUserId = useStore((s) => s.currentUserId);
  const user = useStore((s) => s.getUser(currentUserId));
  const updateProfile = useStore((s) => s.updateProfile);

  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [location, setLocation] = useState(user?.location ?? "");
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Please allow photo access to change your picture.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!res.canceled) setAvatarUrl(res.assets[0].uri);
  };

  const save = async () => {
    if (!username.trim()) {
      Alert.alert("Username required", "Please enter a username.");
      return;
    }
    setSaving(true);
    try {
      // Compress a newly picked avatar; an unchanged http(s) URL passes through.
      const avatar = await preparePhoto(avatarUrl);
      await updateProfile({
        username: username.trim(),
        bio: bio.trim(),
        location: location.trim(),
        avatarUrl: avatar,
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
        <Text className="text-lg font-extrabold text-ink">Edit profile</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        {/* Avatar */}
        <View className="items-center py-6">
          <Pressable onPress={pickAvatar} className="active:opacity-80">
            <Avatar url={avatarUrl} name={username} size={96} />
            <View className="absolute bottom-0 right-0 bg-primary rounded-full p-2 border-2 border-white">
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
          </Pressable>
          <Text className="text-primary-dark font-medium mt-2">Change photo</Text>
        </View>

        <Field label="Username" value={username} onChangeText={setUsername} placeholder="username" autoCapitalize="none" />
        <Field label="Location" value={location} onChangeText={setLocation} placeholder="City, Country" />
        <Field label="Bio" value={bio} onChangeText={setBio} placeholder="Tell buyers about yourself" multiline />

        <View className="px-4 mt-6">
          <Button label={saving ? "Saving…" : "Save"} onPress={save} loading={saving} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  label,
  multiline,
  ...props
}: { label: string; multiline?: boolean } & React.ComponentProps<typeof TextInput>) {
  return (
    <View className="px-4 mt-4">
      <Text className="text-ink-muted text-xs font-semibold uppercase mb-1.5">{label}</Text>
      <TextInput
        placeholderTextColor="#9CA3AF"
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        className={`bg-surface-alt rounded-xl px-4 py-3.5 text-ink text-base ${multiline ? "min-h-[96px]" : ""}`}
        {...props}
      />
    </View>
  );
}
