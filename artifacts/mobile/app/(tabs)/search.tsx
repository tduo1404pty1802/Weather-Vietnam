import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";

import WeatherBackground from "@/components/WeatherBackground";
import WeatherIcon from "@/components/WeatherIcon";
import { useWeatherContext } from "@/context/WeatherContext";
import { City, VIETNAM_CITIES, searchCities } from "@/constants/cities";
import { getWeatherInfo } from "@/constants/weatherCodes";

interface CityWeatherSnapshot {
  temp: number;
  weatherCode: number;
}

type CityWeatherSnapshotMap = Record<string, CityWeatherSnapshot | null>;

function cityKey(city: City): string {
  return `${city.latitude},${city.longitude}`;
}

async function fetchCitySnapshot(city: City): Promise<CityWeatherSnapshot | null> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,weather_code&timezone=${city.timezone}`
    );
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

async function fetchCitySnapshots(cities: City[]): Promise<CityWeatherSnapshotMap> {
  const entries = await Promise.all(
    cities.map(async (city) => [cityKey(city), await fetchCitySnapshot(city)] as const)
  );
  return Object.fromEntries(entries);
}

function CityWeatherItem({
  city,
  onSelect,
  isSaved,
  onToggleSave,
  delay,
  snapshot,
}: {
  city: City;
  onSelect: (c: City) => void;
  isSaved: boolean;
  onToggleSave: (c: City) => void;
  delay: number;
  snapshot?: CityWeatherSnapshot | null;
}) {
  const slideAnim = useRef(new Animated.Value(20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const weatherInfo = snapshot ? getWeatherInfo(snapshot.weatherCode) : null;

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <Pressable
        style={styles.cityItem}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onSelect(city);
        }}
      >
        <View style={styles.cityLeft}>
          <View style={styles.cityPin}>
            {weatherInfo ? (
              <WeatherIcon iconName={weatherInfo.icon} size={16} color="#4FC3F7" />
            ) : (
              <Feather name="map-pin" size={14} color="#4FC3F7" />
            )}
          </View>
          <View>
            <Text style={styles.cityItemName}>{city.name}</Text>
            <Text style={styles.cityItemRegion}>{city.region}</Text>
          </View>
        </View>
        <View style={styles.cityRight}>
          {snapshot !== null && snapshot !== undefined ? (
            <View style={styles.cityTempBlock}>
              <Text style={styles.cityTemp}>{snapshot.temp}°</Text>
              {weatherInfo && (
                <Text style={styles.cityCondition}>{weatherInfo.label}</Text>
              )}
            </View>
          ) : null}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onToggleSave(city);
            }}
            style={styles.saveBtn}
          >
            <Feather
              name={isSaved ? "bookmark" : "bookmark"}
              size={18}
              color={isSaved ? "#FFB300" : "rgba(255,255,255,0.35)"}
            />
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const { setSelectedCity, addCity, removeCity, isCitySaved, savedCities } =
    useWeatherContext();
  const inputRef = useRef<TextInput>(null);

  const results = searchCities(query);
  const showSaved = !query.trim() && savedCities.length > 0;

  const topPad =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad =
    Platform.OS === "web" ? 34 + 84 : insets.bottom + 84;

  const displayData = useMemo(
    () =>
      query.trim()
        ? results
        : showSaved
        ? savedCities
        : VIETNAM_CITIES,
    [query, results, showSaved, savedCities]
  );

  const snapshotQueryKey = useMemo(
    () => displayData.map(cityKey).join("|"),
    [displayData]
  );

  const { data: citySnapshots = {} } = useQuery({
    queryKey: ["city-weather-snapshots", snapshotQueryKey],
    queryFn: () => fetchCitySnapshots(displayData),
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    enabled: displayData.length > 0,
  });

  const handleSelect = useCallback(
    (city: City) => {
      setSelectedCity(city);
      setQuery("");
      router.push("/(tabs)/");
    },
    [setSelectedCity]
  );

  const handleToggleSave = useCallback(
    (city: City) => {
      if (isCitySaved(city)) {
        removeCity(city);
      } else {
        addCity(city);
      }
    },
    [isCitySaved, addCity, removeCity]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: City; index: number }) => (
      <CityWeatherItem
        city={item}
        onSelect={handleSelect}
        isSaved={isCitySaved(item)}
        onToggleSave={handleToggleSave}
        delay={index * 40}
        snapshot={citySnapshots[cityKey(item)]}
      />
    ),
    [handleSelect, isCitySaved, handleToggleSave, citySnapshots]
  );

  const sectionLabel = query.trim()
    ? `${results.length} kết quả`
    : showSaved
    ? "Đã lưu"
    : "Thành phố Việt Nam";

  return (
    <WeatherBackground weatherCode={0}>
      <View
        style={[
          styles.container,
          { paddingTop: topPad + 12, paddingBottom: bottomPad },
        ]}
      >
        <Text style={styles.title}>Tìm kiếm</Text>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color="rgba(255,255,255,0.5)" />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Tìm thành phố..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            style={styles.searchInput}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")}>
              <Feather name="x" size={18} color="rgba(255,255,255,0.5)" />
            </Pressable>
          )}
        </View>

        <Text style={styles.sectionLabel}>{sectionLabel}</Text>

        <FlatList
          data={displayData}
          keyExtractor={(item) => `${item.latitude}-${item.longitude}`}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="map-pin" size={40} color="rgba(255,255,255,0.25)" />
              <Text style={styles.emptyText}>Không tìm thấy thành phố</Text>
            </View>
          }
        />
      </View>
    </WeatherBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#FFFFFF",
    padding: 0,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.45)",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  list: {
    paddingHorizontal: 20,
    gap: 8,
  },
  cityItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  cityLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  cityPin: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(79,195,247,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  cityItemName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  cityItemRegion: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.5)",
    marginTop: 2,
  },
  cityRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cityTempBlock: {
    alignItems: "flex-end",
    gap: 2,
  },
  cityTemp: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  cityCondition: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.5)",
    textAlign: "right",
  },
  saveBtn: {
    padding: 4,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.4)",
  },
});
