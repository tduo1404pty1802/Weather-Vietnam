import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

interface AlertConfig {
  message: string;
  icon: keyof typeof Feather.glyphMap;
  bgColor: string;
  borderColor: string;
}

const ALERT_MAP: Record<number, AlertConfig> = {
  // Mưa rào dữ dội
  82: {
    message: "Mưa rào rất mạnh – hạn chế ra ngoài",
    icon: "cloud-rain",
    bgColor: "rgba(21,101,192,0.85)",
    borderColor: "rgba(100,181,246,0.6)",
  },
  // Mưa lớn liên tục
  65: {
    message: "Mưa lớn kéo dài – chú ý ngập úng",
    icon: "cloud-rain",
    bgColor: "rgba(21,101,192,0.85)",
    borderColor: "rgba(100,181,246,0.6)",
  },
  // Tuyết dày (cao nguyên)
  75: {
    message: "Tuyết rơi dày – đường trơn, di chuyển cẩn thận",
    icon: "cloud-snow",
    bgColor: "rgba(55,71,79,0.85)",
    borderColor: "rgba(176,190,197,0.6)",
  },
  86: {
    message: "Tuyết rào dữ dội – nguy hiểm khi di chuyển",
    icon: "cloud-snow",
    bgColor: "rgba(55,71,79,0.85)",
    borderColor: "rgba(176,190,197,0.6)",
  },
  // Giông bão
  95: {
    message: "Giông bão – không ra ngoài nếu không cần thiết",
    icon: "zap",
    bgColor: "rgba(74,20,140,0.85)",
    borderColor: "rgba(206,147,216,0.6)",
  },
  96: {
    message: "Giông kèm mưa đá – tránh xa khu vực trống trải",
    icon: "zap",
    bgColor: "rgba(74,20,140,0.85)",
    borderColor: "rgba(206,147,216,0.6)",
  },
  99: {
    message: "Giông dữ dội kèm mưa đá lớn – ở trong nhà",
    icon: "alert-triangle",
    bgColor: "rgba(183,28,28,0.85)",
    borderColor: "rgba(239,154,154,0.6)",
  },
  // Sương mù dày (tầm nhìn nguy hiểm)
  48: {
    message: "Sương mù đóng băng – tầm nhìn rất thấp, lái xe cẩn thận",
    icon: "wind",
    bgColor: "rgba(55,71,79,0.85)",
    borderColor: "rgba(176,190,197,0.6)",
  },
};

interface Props {
  weatherCode: number;
  uvIndex?: number;
}

export default function WeatherAlert({ weatherCode, uvIndex }: Props) {
  const slideAnim = useRef(new Animated.Value(-8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const alertConfig = ALERT_MAP[weatherCode];
  // UV >= 8 cũng cảnh báo nếu không có cảnh báo thời tiết khác
  const uvAlert =
    !alertConfig && uvIndex !== undefined && uvIndex >= 8
      ? {
          message: `Chỉ số UV ${uvIndex >= 11 ? "cực kỳ cao" : "rất cao"} (${Math.round(uvIndex)}) – bôi kem chống nắng, che chắn kỹ`,
          icon: "sun" as keyof typeof Feather.glyphMap,
          bgColor: "rgba(230,81,0,0.85)",
          borderColor: "rgba(255,183,77,0.6)",
        }
      : null;

  const alert = alertConfig ?? uvAlert;

  useEffect(() => {
    if (!alert) return;
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 16,
        stiffness: 120,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [weatherCode, uvIndex]);

  if (!alert) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: alert.bgColor,
          borderColor: alert.borderColor,
          opacity: opacityAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Feather name={alert.icon} size={16} color="#FFFFFF" style={styles.icon} />
      <Text style={styles.message}>{alert.message}</Text>
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
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  icon: {
    flexShrink: 0,
  },
  message: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#FFFFFF",
    lineHeight: 18,
  },
});
