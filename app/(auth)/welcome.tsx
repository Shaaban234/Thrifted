import { View, Text } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/Button";

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
          <View className="flex-row items-center gap-2">
            <Ionicons name="repeat" size={40} color="#fff" />
            <Text className="text-white text-5xl font-extrabold">Thrifted</Text>
          </View>
          <Text className="text-white/90 text-xl mt-4 font-medium leading-7">
            Buy and sell pre-loved fashion.{"\n"}Give your wardrobe a second life.
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
            By continuing you agree to our Terms & Privacy Policy
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
