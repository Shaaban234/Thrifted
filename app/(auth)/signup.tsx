import { useState } from "react";
import { View, Text, Pressable, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { TextField } from "@/components/TextField";
import { Button } from "@/components/Button";
import { useStore } from "@/lib/store";

export default function Signup() {
  const signup = useStore((s) => s.signup);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password || !username.trim()) {
      Alert.alert("Missing details", "Please fill in username, email and password.");
      return;
    }
    setLoading(true);
    try {
      await signup(email.trim(), password, username.trim());
      router.replace("/(tabs)");
    } catch (e: any) {
      Alert.alert("Sign up failed", e?.message ?? "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="px-4 pt-2">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={26} className="text-ink" />
        </Pressable>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 px-6 pt-6"
      >
        <Text className="text-3xl font-extrabold text-ink mb-1">Create account</Text>
        <Text className="text-ink-muted mb-8">Join Thrifted and start selling today.</Text>

        <View className="gap-4">
          <TextField label="Username" placeholder="your_username" autoCapitalize="none" value={username} onChangeText={setUsername} />
          <TextField label="Email" placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
          <TextField label="Password" placeholder="Choose a password" secureTextEntry value={password} onChangeText={setPassword} />
        </View>

        <View className="mt-8">
          <Button label="Sign up" onPress={submit} loading={loading} />
        </View>

        <Pressable className="mt-6" onPress={() => router.replace("/(auth)/login")}>
          <Text className="text-center text-ink-muted">
            Already have an account? <Text className="text-primary-dark font-semibold">Log in</Text>
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
