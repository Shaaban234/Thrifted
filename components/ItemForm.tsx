import { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { CATEGORIES, BRANDS, SIZES, CONDITIONS, COLORS } from "@/lib/constants";
import type { ItemCondition } from "@/lib/types";

export interface ItemFormValues {
  photos: string[];
  title: string;
  description: string;
  category: string;
  brand: string;
  size: string;
  condition: ItemCondition;
  color: string;
  price: number;
}

type Option = { value: string; label: string };

export function ItemForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: Partial<ItemFormValues>;
  submitLabel: string;
  onSubmit: (values: ItemFormValues) => void;
}) {
  const [photos, setPhotos] = useState<string[]>(initial?.photos ?? []);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState<string | null>(initial?.category ?? null);
  const [brand, setBrand] = useState<string | null>(initial?.brand ?? null);
  const [size, setSize] = useState<string | null>(initial?.size ?? null);
  const [condition, setCondition] = useState<ItemCondition | null>(initial?.condition ?? null);
  const [color, setColor] = useState<string | null>(initial?.color ?? null);
  const [price, setPrice] = useState(initial?.price != null ? String(initial.price) : "");
  const [expanded, setExpanded] = useState<string | null>(null);

  const categoryLabel = CATEGORIES.find((c) => c.key === category)?.label ?? null;

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Please allow photo access to add pictures.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 5 - photos.length,
    });
    if (!res.canceled) {
      setPhotos((prev) => [...prev, ...res.assets.map((a) => a.uri)].slice(0, 5));
    }
  };

  const valid = photos.length > 0 && title.trim() && category && brand && size && condition && price;

  const submit = () => {
    if (!valid) {
      Alert.alert("Almost there", "Please add a photo, title, category, brand, size, condition and price.");
      return;
    }
    onSubmit({
      photos,
      title: title.trim(),
      description: description.trim(),
      category: category!,
      brand: brand!,
      size: size!,
      condition: condition!,
      color: color ?? "Multi",
      price: parseFloat(price) || 0,
    });
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {/* Photos */}
      <View className="p-4">
        {photos.length === 0 ? (
          <Pressable onPress={pickPhoto} className="border-2 border-dashed border-primary rounded-xl py-8 items-center bg-primary-light active:opacity-80">
            <Ionicons name="camera" size={32} color="#005A63" />
            <Text className="text-primary-dark font-semibold mt-2">Add photos</Text>
            <Text className="text-ink-faint text-xs mt-0.5">Up to 5 · the first is your cover</Text>
          </Pressable>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {photos.map((uri) => (
              <View key={uri} className="relative">
                <Image source={{ uri }} style={{ width: 96, height: 128, borderRadius: 12 }} contentFit="cover" />
                <Pressable onPress={() => setPhotos((p) => p.filter((u) => u !== uri))} className="absolute -top-2 -right-2 bg-ink rounded-full p-1">
                  <Ionicons name="close" size={14} className="text-surface" />
                </Pressable>
              </View>
            ))}
            {photos.length < 5 && (
              <Pressable onPress={pickPhoto} className="w-24 h-32 rounded-xl border-2 border-dashed border-surface-border items-center justify-center bg-surface-alt">
                <Ionicons name="add" size={28} className="text-ink-faint" />
                <Text className="text-ink-faint text-xs mt-1">Add</Text>
              </Pressable>
            )}
          </ScrollView>
        )}
      </View>

      {/* Title + description */}
      <View className="px-4 gap-px">
        <TextInput
          placeholder="Title"
          placeholderTextColor="#9CA3AF"
          value={title}
          onChangeText={setTitle}
          className="bg-surface-alt rounded-t-xl px-4 py-3.5 text-ink text-base"
        />
        <TextInput
          placeholder="Describe your item (condition, measurements, flaws…)"
          placeholderTextColor="#9CA3AF"
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
          className="bg-surface-alt rounded-b-xl px-4 py-3.5 text-ink text-base min-h-[96px]"
        />
      </View>

      {/* Drill-in rows */}
      <View className="mt-4">
        <AccordionRow label="Category" value={categoryLabel} current={category} expanded={expanded === "category"} onToggle={() => setExpanded(expanded === "category" ? null : "category")} options={CATEGORIES.map((c) => ({ value: c.key, label: c.label }))} onSelect={(v) => { setCategory(v); setExpanded(null); }} />
        <AccordionRow label="Brand" value={brand} current={brand} expanded={expanded === "brand"} onToggle={() => setExpanded(expanded === "brand" ? null : "brand")} options={BRANDS.map((b) => ({ value: b, label: b }))} onSelect={(v) => { setBrand(v); setExpanded(null); }} />
        <AccordionRow label="Size" value={size} current={size} expanded={expanded === "size"} onToggle={() => setExpanded(expanded === "size" ? null : "size")} options={SIZES.map((s) => ({ value: s, label: s }))} onSelect={(v) => { setSize(v); setExpanded(null); }} />
        <AccordionRow label="Condition" value={condition} current={condition} expanded={expanded === "condition"} onToggle={() => setExpanded(expanded === "condition" ? null : "condition")} options={CONDITIONS.map((c) => ({ value: c, label: c }))} onSelect={(v) => { setCondition(v as ItemCondition); setExpanded(null); }} />
        <AccordionRow label="Colour" value={color} current={color} expanded={expanded === "color"} onToggle={() => setExpanded(expanded === "color" ? null : "color")} options={COLORS.map((c) => ({ value: c, label: c }))} onSelect={(v) => { setColor(v); setExpanded(null); }} />

        {/* Price row */}
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-surface-border">
          <Text className="text-ink text-base">Price</Text>
          <View className="flex-row items-center">
            <Text className="text-ink-muted mr-1">Rs</Text>
            <TextInput placeholder="0" placeholderTextColor="#9CA3AF" value={price} onChangeText={setPrice} keyboardType="decimal-pad" className="text-ink text-base text-right min-w-[90px]" />
          </View>
        </View>
      </View>

      <View className="px-4 mt-6">
        <Pressable onPress={submit} disabled={!valid} className={`rounded-lg py-3.5 ${valid ? "bg-primary active:opacity-80" : "bg-surface-alt"}`}>
          <Text className={`font-bold text-center text-base ${valid ? "text-white" : "text-ink-faint"}`}>{submitLabel}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function AccordionRow({
  label, value, current, expanded, onToggle, options, onSelect,
}: {
  label: string;
  value: string | null;
  current: string | null;
  expanded: boolean;
  onToggle: () => void;
  options: Option[];
  onSelect: (value: string) => void;
}) {
  return (
    <View className="border-b border-surface-border">
      <Pressable onPress={onToggle} className="flex-row items-center justify-between px-4 py-4 active:bg-surface-alt">
        <Text className="text-ink text-base">{label}</Text>
        <View className="flex-row items-center gap-1.5">
          <Text className={value ? "text-primary-dark font-medium" : "text-ink-faint"}>{value ?? "Select"}</Text>
          <Ionicons name={expanded ? "chevron-up" : "chevron-forward"} size={18} className="text-ink-faint" />
        </View>
      </Pressable>
      {expanded && (
        <View className="px-4 pb-3 flex-row flex-wrap gap-2">
          {options.map((opt) => {
            const selected = opt.value === current;
            return (
              <Pressable key={opt.value} onPress={() => onSelect(opt.value)} className={`rounded-full border px-4 py-2 ${selected ? "border-primary bg-primary-light" : "border-surface-border bg-surface"}`}>
                <Text className={`text-sm font-medium ${selected ? "text-primary-dark" : "text-ink"}`}>{opt.label}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}
