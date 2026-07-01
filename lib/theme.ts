// Theme (light/dark) state. The chosen scheme is applied through nativewind's
// runtime `colorScheme` (which flips the CSS variables in global.css) and
// persisted to AsyncStorage so it survives app restarts.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colorScheme, cssInterop } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { create } from "zustand";

// Let Ionicons accept `className` (e.g. "text-ink") and map the resolved text
// color onto its `color` prop, so icon colors follow the theme like text does.
cssInterop(Ionicons, {
  className: { target: "style", nativeStyleToProp: { color: "color" } },
});

export type ThemeMode = "light" | "dark";
const KEY = "thrifted.theme";

interface ThemeState {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  toggle: () => void;
  restore: () => Promise<void>;
}

export const useTheme = create<ThemeState>((set, get) => ({
  mode: "light",
  setMode: (m) => {
    colorScheme.set(m);
    set({ mode: m });
    AsyncStorage.setItem(KEY, m).catch(() => {});
  },
  toggle: () => get().setMode(get().mode === "dark" ? "light" : "dark"),
  restore: async () => {
    const saved = await AsyncStorage.getItem(KEY);
    const mode: ThemeMode = saved === "dark" ? "dark" : "light";
    colorScheme.set(mode);
    set({ mode });
  },
}));
