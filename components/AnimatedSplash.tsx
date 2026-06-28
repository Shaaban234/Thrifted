import { useEffect, useRef } from "react";
import { Animated, Text, StyleSheet, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Full-screen launch animation: logo fades + scales in, holds, then the whole
// overlay fades out. Sits on top of the native (teal) splash for a seamless start.
export function AnimatedSplash({ onFinish }: { onFinish: () => void }) {
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 70, useNativeDriver: true }),
      ]),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.delay(650),
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 450,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]} pointerEvents="none">
      <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }], alignItems: "center" }}>
        <Ionicons name="repeat" size={68} color="#ffffff" />
        <Text style={styles.title}>Thrifted</Text>
      </Animated.View>
      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        Pre-loved fashion
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#007782",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  title: { color: "#ffffff", fontSize: 44, fontWeight: "800", marginTop: 8, letterSpacing: -0.5 },
  tagline: { color: "rgba(255,255,255,0.85)", fontSize: 15, marginTop: 14 },
});
