import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { City } from "@/constants/cities";
import { WeatherData } from "@/hooks/useWeather";

const NOTIFICATION_STORAGE_KEY = "@weather_daily_notification_id";

let notificationsModule: any | null | undefined;

function getNotifications() {
  if (notificationsModule !== undefined) return notificationsModule;
  try {
    // Lazy require để Expo Go không crash ngay khi module native không khả dụng.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require("expo-notifications");
    mod.setNotificationHandler?.({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    notificationsModule = mod;
  } catch {
    notificationsModule = null;
  }
  return notificationsModule;
}

interface Props {
  city: City;
  data: WeatherData;
}

function getSmartMessage(city: City, data: WeatherData): string {
  const rain = data.daily[0]?.precipitationProbabilityMax ?? 0;
  const uv = data.current.uvIndex;
  const feelsLike = data.current.feelsLike;
  const wind = data.current.windSpeed;

  if (rain >= 65) return `${city.name}: hôm nay dễ mưa (${rain}%). Nhớ mang ô trước khi ra ngoài.`;
  if (uv >= 8) return `${city.name}: UV rất cao (${Math.round(uv)}). Che chắn và bôi chống nắng nhé.`;
  if (feelsLike >= 36) return `${city.name}: cảm giác ${feelsLike}°C, nhớ uống nước và tránh nắng gắt.`;
  if (wind >= 40) return `${city.name}: gió mạnh ${wind} km/h, cẩn thận khi di chuyển ngoài trời.`;
  return `${city.name}: ${data.current.temperature}°C, kiểm tra nhanh thời tiết trước khi ra ngoài.`;
}

async function ensureNotificationPermission(): Promise<boolean> {
  const Notifications = getNotifications();
  if (!Notifications) return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function ensureAndroidChannel() {
  const Notifications = getNotifications();
  if (!Notifications) return;
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("weather-daily", {
    name: "Weather daily reminders",
    importance: Notifications.AndroidImportance?.DEFAULT ?? 3,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#4FC3F7",
  });
}

export default function WeatherNotifications({ city, data }: Props) {
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [unsupported, setUnsupported] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;

  const smartMessage = useMemo(() => getSmartMessage(city, data), [city, data]);
  const riskText = useMemo(() => {
    const rain = data.daily[0]?.precipitationProbabilityMax ?? 0;
    if (rain >= 65) return "Có mưa lớn trong ngày";
    if (data.current.uvIndex >= 8) return "UV cao cần che chắn";
    if (data.current.feelsLike >= 36) return "Nắng nóng, dễ mất nước";
    if (data.current.windSpeed >= 40) return "Gió mạnh cần chú ý";
    return "Nhắc nhẹ mỗi sáng";
  }, [data]);

  useEffect(() => {
    AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY).then((id) => setEnabled(Boolean(id)));
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
  }, [fadeAnim, scaleAnim]);

  const scheduleDailyReminder = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const Notifications = getNotifications();
      if (!Notifications) {
        setUnsupported(true);
        return;
      }
      const granted = await ensureNotificationPermission();
      if (!granted) return;
      await ensureAndroidChannel();

      const oldId = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY);
      if (oldId) await Notifications.cancelScheduledNotificationAsync(oldId);

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Vietnam Weather",
          body: smartMessage,
          sound: true,
        },
        trigger: {
          channelId: "weather-daily",
          hour: 7,
          minute: 30,
          repeats: true,
        } as any,
      });

      await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, id);
      setEnabled(true);
    } finally {
      setBusy(false);
    }
  }, [busy, smartMessage]);

  const cancelReminder = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const Notifications = getNotifications();
      if (!Notifications) {
        setUnsupported(true);
        return;
      }
      const oldId = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY);
      if (oldId) await Notifications.cancelScheduledNotificationAsync(oldId);
      await AsyncStorage.removeItem(NOTIFICATION_STORAGE_KEY);
      setEnabled(false);
    } finally {
      setBusy(false);
    }
  }, [busy]);

  const sendPreview = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const Notifications = getNotifications();
      if (!Notifications) {
        setUnsupported(true);
        return;
      }
      const granted = await ensureNotificationPermission();
      if (!granted) return;
      await ensureAndroidChannel();
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Dự báo thông minh",
          body: smartMessage,
          sound: true,
        },
        trigger: {
          channelId: "weather-daily",
          seconds: 2,
        } as any,
      });
    } finally {
      setBusy(false);
    }
  }, [busy, smartMessage]);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Nhắc nhở thông minh</Text>
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
          <View style={[styles.iconBg, enabled && styles.iconBgActive]}>
            <Feather name={enabled ? "bell" : "bell-off"} size={18} color={enabled ? "#0B1D3A" : "#4FC3F7"} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>{enabled ? "Đã bật nhắc 7:30" : "Bật nhắc mỗi sáng"}</Text>
            <Text style={styles.subtitle}>{riskText}</Text>
          </View>
          <View style={[styles.statusDot, enabled && styles.statusDotActive]} />
        </View>

        <Text style={styles.message}>
          {unsupported
            ? "Expo Go hiện không hỗ trợ notification native đầy đủ trên Android SDK mới. Tính năng này sẽ hoạt động khi chạy development build."
            : smartMessage}
        </Text>

        <View style={styles.actions}>
          <Pressable
            onPress={enabled ? cancelReminder : scheduleDailyReminder}
            style={[styles.primaryBtn, enabled && styles.secondaryBtn]}
            disabled={busy}
          >
            <Text style={[styles.primaryText, enabled && styles.secondaryText]}>
              {enabled ? "Tắt nhắc" : "Bật 7:30"}
            </Text>
          </Pressable>
          <Pressable onPress={sendPreview} style={styles.previewBtn} disabled={busy}>
            <Feather name="send" size={13} color="#FFFFFF" />
            <Text style={styles.previewText}>Thử ngay</Text>
          </Pressable>
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
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(79,195,247,0.25)",
    backgroundColor: "rgba(79,195,247,0.1)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBg: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(79,195,247,0.18)",
  },
  iconBgActive: {
    backgroundColor: "#4FC3F7",
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  subtitle: {
    marginTop: 2,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.5)",
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  statusDotActive: {
    backgroundColor: "#A5D6A7",
  },
  message: {
    marginTop: 14,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.68)",
  },
  actions: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
  },
  primaryBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#4FC3F7",
  },
  secondaryBtn: {
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  primaryText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: "#0B1D3A",
  },
  secondaryText: {
    color: "#FFFFFF",
  },
  previewBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  previewText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
});
