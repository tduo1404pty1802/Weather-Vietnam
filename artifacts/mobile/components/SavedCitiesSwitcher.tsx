import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useQueries } from "@tanstack/react-query";
import React, { useEffect, useRef } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { City } from "@/constants/cities";
import { getWeatherInfo } from "@/constants/weatherCodes";
import { useWeatherContext } from "@/context/WeatherContext";
import WeatherIcon from "@/components/WeatherIcon";

interface Snapshot {
  temp: number;
  weatherCode: number;
}

async function fetchSnapshot(city: City): Promise<Snapshot | null> {
  try {
    const params = new URLSearchParams({
      latitude: city.latitude.toString(),
      longitude: city.longitude.toString(),
      current: "temperature_2m,weather_code",
      timezone: city.timezone,
    });
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      temp: Math.round(data.current.temperature_2m),
      weatherCode: data.current.weather_code,
    };
  } catch {
    return null;
  }
}

function sameCity(a: City, b: City) {
  return a.latitude === b.latitude && a.longitude === b.longitude;
}

function SavedCityPill({
  city,
  snapshot,
  selected,
  index,
  onPress,
}: {
  city: City;
  snapshot?: Snapshot | null;
  selected: boolean;
  index: number;
  onPress: () => void;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  const info = snapshot ? getWeatherInfo(snapshot.weatherCode) : null;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      delay: index * 55,
      damping: 16,
      stiffness: 120,
      useNativeDriver: true,
    }).start();
  }, [anim, index]);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] });

  return (
    <Animated.View style={{ opacity: anim, transform: [{ translateY }] }}>
      <Pressable
        onPress={onPress}
        style={[styles.pill, selected && styles.pillActive]}
      >
        <View style={[styles.iconWrap, selected && styles.iconWrapActive]}>
          {info ? (
            <WeatherIcon
              iconName={info.icon}
              size={15}
              color={selected ? "#0B1D3A" : "#4FC3F7"}
            />
          ) : (
            <Feather name="map-pin" size={14} color={selected ? "#0B1D3A" : "#4FC3F7"} />
          )}
        </View>
        <View style={styles.textBlock}>
          <Text style={[styles.cityName, selected && styles.activeText]} numberOfLines={1}>
            {city.name}
          </Text>
          <Text style={[styles.region, selected && styles.activeSubText]} numberOfLines={1}>
            {snapshot ? `${snapshot.temp}° · ${info?.label ?? ""}` : city.region}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function SavedCitiesSwitcher() {
  const { savedCities, selectedCity, setSelectedCity } = useWeatherContext();
  const visibleCities = savedCities.filter((city, index, arr) =>
    arr.findIndex((item) => sameCity(item, city)) === index
  );

  const snapshots = useQueries({
    queries: visibleCities.map((city) => ({
      queryKey: ["saved-city-snapshot", city.latitude, city.longitude],
      queryFn: () => fetchSnapshot(city),
      staleTime: 15 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
    })),
  });

  if (visibleCities.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.sectionTitle}>Đổi nhanh thành phố</Text>
        <Text style={styles.count}>{visibleCities.length} đã lưu</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {visibleCities.map((city, index) => (
          <SavedCityPill
            key={`${city.latitude}-${city.longitude}`}
            city={city}
            snapshot={snapshots[index]?.data}
            selected={sameCity(city, selectedCity)}
            index={index}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedCity(city);
            }}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 14,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  count: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.35)",
  },
  scroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  pill: {
    width: 178,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  pillActive: {
    backgroundColor: "#4FC3F7",
    borderColor: "rgba(255,255,255,0.45)",
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(79,195,247,0.16)",
  },
  iconWrapActive: {
    backgroundColor: "rgba(11,29,58,0.12)",
  },
  textBlock: {
    flex: 1,
  },
  cityName: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  activeText: {
    color: "#0B1D3A",
  },
  region: {
    marginTop: 2,
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.45)",
  },
  activeSubText: {
    color: "rgba(11,29,58,0.72)",
  },
});
