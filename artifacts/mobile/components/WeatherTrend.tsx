import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { City } from "@/constants/cities";

interface Props {
  city: City;
  currentTemp: number;
  currentTime: string;
}

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function fetchYesterdayTemperature(
  city: City,
  currentTime: string
): Promise<number | null> {
  const now = new Date(currentTime);
  const targetHour = now.getHours();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const dateKey = toDateKey(yesterday);

  const params = new URLSearchParams({
    latitude: city.latitude.toString(),
    longitude: city.longitude.toString(),
    start_date: dateKey,
    end_date: dateKey,
    hourly: "temperature_2m",
    timezone: city.timezone,
  });

  const res = await fetch(`https://archive-api.open-meteo.com/v1/archive?${params}`);
  if (!res.ok) return null;
  const data = await res.json();
  const index = data.hourly?.time?.findIndex((t: string) => {
    const d = new Date(t);
    return d.getHours() === targetHour;
  });
  if (index === undefined || index < 0) return null;
  const value = data.hourly.temperature_2m[index];
  return typeof value === "number" ? Math.round(value) : null;
}

export default function WeatherTrend({ city, currentTemp, currentTime }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;

  const { data: yesterdayTemp } = useQuery({
    queryKey: ["yesterday-temp", city.latitude, city.longitude, currentTime.slice(0, 13)],
    queryFn: () => fetchYesterdayTemperature(city, currentTime),
    staleTime: 6 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    if (yesterdayTemp === null || yesterdayTemp === undefined) return;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 16,
        stiffness: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, [yesterdayTemp]);

  if (yesterdayTemp === null || yesterdayTemp === undefined) return null;

  const diff = currentTemp - yesterdayTemp;
  const absDiff = Math.abs(diff);
  const isWarmer = diff > 0;
  const isSame = absDiff < 1;
  const color = isSame ? "#A5D6A7" : isWarmer ? "#FFB300" : "#81D4FA";
  const icon = isSame ? "minus" : isWarmer ? "trending-up" : "trending-down";
  const title = isSame
    ? "Gần giống hôm qua"
    : isWarmer
    ? `Ấm hơn hôm qua ${absDiff}°C`
    : `Mát hơn hôm qua ${absDiff}°C`;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={[styles.iconBg, { backgroundColor: `${color}26` }]}>
        <Feather name={icon} size={15} color={color} />
      </View>
      <View style={styles.textBlock}>
        <Text style={[styles.title, { color }]}>{title}</Text>
        <Text style={styles.subtitle}>Cùng giờ hôm qua {yesterdayTemp}°C</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    gap: 10,
  },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  subtitle: {
    marginTop: 2,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.45)",
  },
});
