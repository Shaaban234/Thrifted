import { View, Text } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";

export default function Welcome() {
  return (
    <View className="flex-1 bg-primary">
      <Image
        source={{ uri: "https://loremflickr.com/800/1200/wardrobe,clothes?lock=3" }}
        style={{ position: "absolute", width: "100%", height: "100%", opacity: 0.25 }}
        contentFit="cover"
      />
      <SafeAreaView className="flex-1 justify-between px-6 py-6">
        <View className="flex-1 justify-center">
          <Logo size={34} light />
          <Text className="text-white/90 text-xl mt-6 font-medium leading-7">
            Purana ka naya ghar.{"\n"}Buy and sell pre-loved fashion.
          </Text>
        </View>

        <View className="gap-3">
          <Button
            label="Sign up"
            variant="secondary"
            onPress={() => router.push("/(auth)/signup")}
          />
          <Button
            label="Log in"
            variant="outline"
            onPress={() => router.push("/(auth)/login")}
          />
          <Text className="text-white/70 text-center text-xs mt-2">
            By continuing you agree to our{" "}
            <Text className="font-semibold underline" onPress={() => router.push("/legal/terms" as any)}>Terms</Text>
            {" & "}
            <Text className="font-semibold underline" onPress={() => router.push("/legal/privacy" as any)}>Privacy Policy</Text>
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
