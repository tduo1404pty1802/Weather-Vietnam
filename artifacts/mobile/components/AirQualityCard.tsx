import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { City } from "@/constants/cities";
import { getAqiLevel } from "@/constants/weatherCodes";

interface AirQualityData {
  aqi: number;
  pm25: number;
  pm10: number;
  ozone: number;
}

interface Props {
  city: City;
}

async function fetchAirQuality(city: City): Promise<AirQualityData | null> {
  const params = new URLSearchParams({
    latitude: city.latitude.toString(),
    longitude: city.longitude.toString(),
    current: ["us_aqi", "pm2_5", "pm10", "ozone"].join(","),
    timezone: city.timezone,
  });

  const res = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${params}`);
  if (!res.ok) return null;
  const data = await res.json();
  const current = data.current;
  if (!current || typeof current.us_aqi !== "number") return null;

  return {
    aqi: Math.round(current.us_aqi),
    pm25: Math.round(current.pm2_5 ?? 0),
    pm10: Math.round(current.pm10 ?? 0),
    ozone: Math.round(current.ozone ?? 0),
  };
}

export default function AirQualityCard({ city }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;

  const { data } = useQuery({
    queryKey: ["air-quality", city.latitude, city.longitude],
    queryFn: () => fetchAirQuality(city),
    staleTime: 30 * 60 * 1000,
    gcTime: 6 * 60 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    if (!data) return;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 16,
        stiffness: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, [data]);

  if (!data) return null;

  const level = getAqiLevel(data.aqi);
  const progress = Math.min(data.aqi / 200, 1);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Chất lượng không khí</Text>
      <Animated.View
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.header}>
          <View style={[styles.iconBg, { backgroundColor: `${level.color}26` }]}>
            <Feather name="activity" size={18} color={level.color} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.label}>AQI Hoa Kỳ</Text>
            <Text style={[styles.status, { color: level.color }]}>{level.label}</Text>
          </View>
          <Text style={[styles.aqiValue, { color: level.color }]}>{data.aqi}</Text>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress * 100}%`, backgroundColor: level.color },
            ]}
          />
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{data.pm25}</Text>
            <Text style={styles.metricLabel}>PM2.5</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{data.pm10}</Text>
            <Text style={styles.metricLabel}>PM10</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{data.ozone}</Text>
            <Text style={styles.metricLabel}>Ozone</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.09)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.13)",
    padding: 16,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.45)",
  },
  status: {
    marginTop: 2,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  aqiValue: {
    fontSize: 34,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  progressFill: {
    height: 5,
    borderRadius: 3,
  },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metric: {
    flex: 1,
    alignItems: "center",
  },
  metricValue: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  metricLabel: {
    marginTop: 2,
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.45)",
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
});
