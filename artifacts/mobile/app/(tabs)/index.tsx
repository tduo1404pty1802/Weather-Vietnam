import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import WeatherBackground from "@/components/WeatherBackground";
import WeatherScene, { SCENE_HEIGHT } from "@/components/WeatherScene";
import WeatherAlert from "@/components/WeatherAlert";
import WeatherTrend from "@/components/WeatherTrend";
import AirQualityCard from "@/components/AirQualityCard";
import WeatherInsights from "@/components/WeatherInsights";
import SavedCitiesSwitcher from "@/components/SavedCitiesSwitcher";
import WeatherNotifications from "@/components/WeatherNotifications";
import RainRadarCard from "@/components/RainRadarCard";
import WeatherWidgetPreview from "@/components/WeatherWidgetPreview";
import ActivityPlanner from "@/components/ActivityPlanner";
import RainTimeline from "@/components/RainTimeline";
import DailyForecast from "@/components/DailyForecast";
import TempChart from "@/components/TempChart";
import LifestyleCards from "@/components/LifestyleCards";
import WeatherDetails from "@/components/WeatherDetails";
import SunriseSunset from "@/components/SunriseSunset";
import { useWeatherContext } from "@/context/WeatherContext";
import { getWeatherInfo } from "@/constants/weatherCodes";
import { useWeather } from "@/hooks/useWeather";

function formatDateTime(): string {
  const now = new Date();
  const days = [
    "Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư",
    "Thứ năm", "Thứ sáu", "Thứ bảy",
  ];
  return `${days[now.getDay()]}, ${now.getDate()}/${now.getMonth() + 1} · ${now
    .getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { selectedCity, setLocationData, isUsingLocation } = useWeatherContext();
  const { data, isLoading, isError, refetch, isFetching } = useWeather(selectedCity);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const heroY = useRef(new Animated.Value(24)).current;
  const sceneFade = useRef(new Animated.Value(0)).current;

  const weatherCode = data?.current?.weatherCode ?? 0;
  const info = getWeatherInfo(weatherCode);

  useEffect(() => {
    if (data) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.spring(heroY, { toValue: 0, useNativeDriver: true, damping: 16, stiffness: 100 }),
        Animated.timing(sceneFade, { toValue: 1, duration: 900, useNativeDriver: true }),
      ]).start();
    }
  }, [data]);

  const handleLocationPress = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (Platform.OS === "web") {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLocationData({
              name: "Vị trí của bạn",
              region: "",
              country: "Việt Nam",
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              timezone: "Asia/Ho_Chi_Minh",
            });
          },
          () => {
            // Trình duyệt hoặc emulator không có vị trí: giữ nguyên thành phố hiện tại.
          },
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 10 * 60 * 1000 }
        );
      }
      return;
    }
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    let loc: Location.LocationObject | null = null;
    try {
      loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
    } catch {
      try {
        loc = await Location.getLastKnownPositionAsync({
          maxAge: 30 * 60 * 1000,
          requiredAccuracy: 5000,
        });
      } catch {
        loc = null;
      }
    }
    if (!loc) return;

    const { latitude, longitude } = loc.coords;

    // Thử reverse geocoding để lấy tên thực
    let locationName = "Vị trí của bạn";
    let regionName = "";
    try {
      const places = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (places.length > 0) {
        const p = places[0];
        // Ưu tiên: district > subregion > city > region
        const district = p.district ?? p.subregion ?? p.city ?? p.region;
        const city = p.city ?? p.subregion ?? p.region;
        if (district) locationName = district;
        if (city && city !== district) regionName = city;
      }
    } catch {
      // Nếu reverse geocoding lỗi thì dùng fallback
    }

    setLocationData({
      name: locationName,
      region: regionName,
      country: "Việt Nam",
      latitude,
      longitude,
      timezone: "Asia/Ho_Chi_Minh",
    });
  }, [setLocationData]);

  const handleSharePress = useCallback(async () => {
    if (!data) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const today = data.daily[0];
    const message = [
      `Thời tiết ${selectedCity.name}: ${data.current.temperature}°C, ${info.label}.`,
      `Cảm giác như ${data.current.feelsLike}°C.`,
      today ? `Cao nhất ${today.tempMax}°C, thấp nhất ${today.tempMin}°C.` : null,
      `Độ ẩm ${data.current.humidity}%, gió ${data.current.windSpeed} km/h.`,
      "Chia sẻ từ Vietnam Weather.",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await Share.share({ message });
    } catch {
      // Người dùng hủy share sheet hoặc nền tảng không hỗ trợ: bỏ qua.
    }
  }, [data, info.label, selectedCity.name]);

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 84 : insets.bottom + 84;

  const todaySunrise = data?.daily[0]?.sunrise;
  const todaySunset = data?.daily[0]?.sunset;

  return (
    <WeatherBackground weatherCode={weatherCode} sunrise={todaySunrise} sunset={todaySunset}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPad + 8, paddingBottom: bottomPad },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={refetch}
            tintColor="rgba(255,255,255,0.7)"
          />
        }
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.push("/(tabs)/search")}
            style={styles.cityPressable}
          >
            <Feather name="map-pin" size={13} color="rgba(255,255,255,0.65)" />
            <Text style={styles.cityName} numberOfLines={1}>
              {selectedCity.name}
            </Text>
            <Feather name="chevron-down" size={13} color="rgba(255,255,255,0.45)" />
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable onPress={handleSharePress} style={styles.locationBtn} disabled={!data}>
              <Feather
                name="share-2"
                size={15}
                color={data ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.25)"}
              />
            </Pressable>
            <Pressable onPress={handleLocationPress} style={styles.locationBtn}>
              <Feather
                name="navigation"
                size={15}
                color={isUsingLocation ? "#4FC3F7" : "rgba(255,255,255,0.55)"}
              />
            </Pressable>
          </View>
        </View>
        <Text style={styles.dateTime}>{formatDateTime()}</Text>

        <SavedCitiesSwitcher />

        {/* ── Loading / Error ── */}
        {isLoading && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="rgba(255,255,255,0.6)" />
            <Text style={styles.loadingText}>Đang tải thời tiết...</Text>
          </View>
        )}
        {isError && (
          <View style={styles.centered}>
            <Feather name="wifi-off" size={40} color="rgba(255,255,255,0.3)" />
            <Text style={styles.errorText}>Không tải được dữ liệu</Text>
            <Pressable onPress={() => refetch()} style={styles.retryBtn}>
              <Text style={styles.retryText}>Thử lại</Text>
            </Pressable>
          </View>
        )}

        {data && (
          <>
            {/* ── Animated Weather Scene ── */}
            <Animated.View style={[styles.sceneWrapper, { opacity: sceneFade }]}>
              <WeatherScene weatherCode={weatherCode} sunrise={todaySunrise} sunset={todaySunset} />

              {/* Overlaid temperature + condition */}
              <Animated.View
                style={[
                  styles.heroOverlay,
                  { opacity: fadeAnim, transform: [{ translateY: heroY }] },
                ]}
              >
                <Text style={styles.temperature}>
                  {data.current.temperature}
                  <Text style={styles.tempUnit}>°</Text>
                </Text>
                <Text style={styles.condition}>{info.label}</Text>
              </Animated.View>
            </Animated.View>

            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: heroY }] }}>

              {/* ── High/Low/Feels pill ── */}
              <View style={styles.pillRow}>
                <View style={styles.pill}>
                  <Feather name="arrow-up" size={10} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.pillText}>{data.daily[0]?.tempMax}°</Text>
                </View>
                <View style={styles.dot} />
                <View style={styles.pill}>
                  <Feather name="arrow-down" size={10} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.pillText}>{data.daily[0]?.tempMin}°</Text>
                </View>
                <View style={styles.dot} />
                <Text style={styles.pillText}>
                  Cảm giác {data.current.feelsLike}°C
                </Text>
              </View>

              <WeatherTrend
                city={selectedCity}
                currentTemp={data.current.temperature}
                currentTime={data.current.time}
              />

              {/* ── Quick stats strip ── */}
              <View style={styles.statsStrip}>
                <View style={styles.statItem}>
                  <Feather name="droplet" size={13} color="#81D4FA" />
                  <Text style={styles.statValue}>{data.current.humidity}%</Text>
                  <Text style={styles.statLabel}>Độ ẩm</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Feather name="wind" size={13} color="#81D4FA" />
                  <Text style={styles.statValue}>{data.current.windSpeed}</Text>
                  <Text style={styles.statLabel}>km/h</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Feather name="sun" size={13} color="#FFB300" />
                  <Text style={styles.statValue}>{Math.round(data.current.uvIndex)}</Text>
                  <Text style={styles.statLabel}>UV</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Feather name="eye" size={13} color="#81D4FA" />
                  <Text style={styles.statValue}>{data.current.visibility}</Text>
                  <Text style={styles.statLabel}>km</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Feather name="activity" size={13} color="#CE93D8" />
                  <Text style={styles.statValue}>{data.current.pressure}</Text>
                  <Text style={styles.statLabel}>hPa</Text>
                </View>
              </View>

              {/* ── Lifestyle suggestions ── */}
              <WeatherAlert
                weatherCode={weatherCode}
                uvIndex={data.current.uvIndex}
              />
              <WeatherInsights data={data} />
              <ActivityPlanner data={data} />
              <RainTimeline data={data.hourly} />
              <WeatherNotifications city={selectedCity} data={data} />
              <LifestyleCards data={data} />

              {/* ── 24h hourly forecast ── */}
              <TempChart data={data.hourly} />

              {/* ── 7-day forecast ── */}
              <DailyForecast data={data.daily} />

              {/* ── Sunrise/Sunset ── */}
              {data.daily[0]?.sunrise && (
                <SunriseSunset
                  sunrise={data.daily[0].sunrise}
                  sunset={data.daily[0].sunset}
                />
              )}

              {/* ── Air quality ── */}
              <AirQualityCard city={selectedCity} />

              {/* ── Rain radar ── */}
              <RainRadarCard city={selectedCity} />

              {/* ── Widget preview ── */}
              <WeatherWidgetPreview city={selectedCity} data={data} />

              {/* ── Detail cards ── */}
              <WeatherDetails
                humidity={data.current.humidity}
                windSpeed={data.current.windSpeed}
                windDirection={data.current.windDirection}
                uvIndex={data.current.uvIndex}
                visibility={data.current.visibility}
                pressure={data.current.pressure}
                precipitation={data.current.precipitation}
                feelsLike={data.current.feelsLike}
              />

              <Text style={styles.updateTime}>
                Cập nhật {new Date(data.current.time).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })} · Tự động làm mới mỗi 10 phút
              </Text>
            </Animated.View>
          </>
        )}
      </ScrollView>
    </WeatherBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { flexGrow: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 2,
  },
  cityPressable: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  cityName: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    maxWidth: 220,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationBtn: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
  },
  dateTime: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.45)",
    paddingHorizontal: 20,
    marginBottom: 8,
  },

  centered: {
    alignItems: "center",
    paddingVertical: 80,
    gap: 14,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.5)",
  },
  errorText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.55)",
  },
  retryBtn: {
    backgroundColor: "rgba(255,255,255,0.14)",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  retryText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },

  sceneWrapper: {
    position: "relative",
    height: SCENE_HEIGHT,
    overflow: "hidden",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 12,
  },
  temperature: {
    fontSize: 80,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: -4,
    lineHeight: 88,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  tempUnit: {
    fontSize: 40,
    letterSpacing: 0,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.75)",
  },
  condition: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.9)",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    marginTop: 2,
  },

  pillRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    backgroundColor: "rgba(255,255,255,0.09)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginTop: 8,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  pillText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.75)",
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(255,255,255,0.25)",
  },

  statsStrip: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.09)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingVertical: 13,
    paddingHorizontal: 4,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  statValue: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 9,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.4)",
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.1)",
  },

  updateTime: {
    textAlign: "center",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.28)",
    marginTop: 24,
    marginBottom: 4,
    paddingHorizontal: 20,
  },
});
