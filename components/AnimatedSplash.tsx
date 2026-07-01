import { useEffect, useRef } from "react";
import { Animated, View, Text, StyleSheet, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Full-screen launch animation over the native (teal) splash:
//  1. the brand mark spins + scales in,
//  2. "Naya" and "Purana" slide in from opposite sides to meet in the middle
//     (new meets old — the idea behind the marketplace),
//  3. the tagline rises in, holds, then the whole overlay fades out.
export function AnimatedSplash({ onFinish }: { onFinish: () => void }) {
  const container = useRef(new Animated.Value(1)).current;
  const mark = useRef(new Animated.Value(0)).current; // drives spin/scale/opacity
  const naya = useRef(new Animated.Value(0)).current; // slides from left
  const purana = useRef(new Animated.Value(0)).current; // slides from right
  const tagline = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(mark, {
        toValue: 1,
        duration: 620,
        easing: Easing.out(Easing.back(1.6)),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.spring(naya, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }),
        Animated.spring(purana, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }),
      ]),
      Animated.timing(tagline, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.delay(750),
      Animated.timing(container, {
        toValue: 0,
        duration: 450,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => onFinish());
  }, []);

  const markRotate = mark.interpolate({ inputRange: [0, 1], outputRange: ["-180deg", "0deg"] });
  const markScale = mark.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  const nayaX = naya.interpolate({ inputRange: [0, 1], outputRange: [-34, 0] });
  const puranaX = purana.interpolate({ inputRange: [0, 1], outputRange: [34, 0] });
  const taglineY = tagline.interpolate({ inputRange: [0, 1], outputRange: [10, 0] });

  return (
    <Animated.View style={[styles.container, { opacity: container }]} pointerEvents="none">
      <Animated.View style={{ opacity: mark, transform: [{ scale: markScale }, { rotate: markRotate }] }}>
        <View style={styles.mark}>
          <Ionicons name="sync" size={52} color="#007782" />
        </View>
      </Animated.View>

      <View style={styles.wordRow}>
        <Animated.Text style={[styles.word, { color: "#FFFFFF", opacity: naya, transform: [{ translateX: nayaX }] }]}>
          Naya
        </Animated.Text>
        <Animated.Text style={[styles.word, { color: "rgba(255,255,255,0.72)", opacity: purana, transform: [{ translateX: puranaX }] }]}>
          Purana
        </Animated.Text>
      </View>

      <Animated.Text style={[styles.tagline, { opacity: tagline, transform: [{ translateY: taglineY }] }]}>
        Purana ka naya ghar
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
  mark: {
    width: 88,
    height: 88,
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  wordRow: { flexDirection: "row", marginTop: 18 },
  word: { fontSize: 40, fontWeight: "800", letterSpacing: -0.5 },
  tagline: { color: "rgba(255,255,255,0.9)", fontSize: 15, marginTop: 14, fontWeight: "500" },
});
