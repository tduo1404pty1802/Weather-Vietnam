import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

interface Props {
  iconName: string;
  size?: number;
  color?: string;
}

const FEATHER_ICON_MAP: Record<string, keyof typeof Feather.glyphMap> = {
  sun: "sun",
  cloud: "cloud",
  "cloud-drizzle": "cloud-drizzle",
  "cloud-rain": "cloud-rain",
  "cloud-snow": "cloud-snow",
  "cloud-lightning": "cloud-lightning",
  wind: "wind",
};

export default function WeatherIcon({
  iconName,
  size = 48,
  color = "#FFFFFF",
}: Props) {
  const name = FEATHER_ICON_MAP[iconName] ?? "cloud";
  return (
    <View style={styles.container}>
      <Feather name={name} size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
