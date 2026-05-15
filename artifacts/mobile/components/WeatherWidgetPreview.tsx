import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { City } from "@/constants/cities";
import { getWeatherInfo } from "@/constants/weatherCodes";
import { WeatherData } from "@/hooks/useWeather";
import WeatherIcon from "@/components/WeatherIcon";

interface Props {
  city: City;
  data: WeatherData;
}

export default function WeatherWidgetPreview({ city, data }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;
  const info = getWeatherInfo(data.current.weatherCode);
  const today = data.daily[0];

  useEffect(() => {
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
  }, [fadeAnim, slideAnim]);

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.sectionTitle}>Widget preview</Text>
        <Text style={styles.note}>Native build sau</Text>
      </View>
      <Animated.View
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.widgetLarge}>
          <View style={styles.widgetHeader}>
            <Text style={styles.widgetCity} numberOfLines={1}>{city.name}</Text>
            <Feather name="more-horizontal" size={16} color="rgba(255,255,255,0.5)" />
          </View>
          <View style={styles.widgetMain}>
            <View>
              <Text style={styles.widgetTemp}>{data.current.temperature}°</Text>
              <Text style={styles.widgetCondition}>{info.label}</Text>
            </View>
            <View style={styles.iconBubble}>
              <WeatherIcon iconName={info.icon} size={32} color="#0B1D3A" />
            </View>
          </View>
          <View style={styles.widgetFooter}>
            <Text style={styles.footerText}>H {today?.tempMax ?? "--"}°</Text>
            <View style={styles.footerDot} />
            <Text style={styles.footerText}>L {today?.tempMin ?? "--"}°</Text>
            <View style={styles.footerDot} />
            <Text style={styles.footerText}>Mưa {today?.precipitationProbabilityMax ?? 0}%</Text>
          </View>
        </View>

        <View style={styles.widgetSmallRow}>
          <View style={styles.widgetSmall}>
            <Feather name="droplet" size={15} color="#81D4FA" />
            <Text style={styles.smallValue}>{data.current.humidity}%</Text>
            <Text style={styles.smallLabel}>Độ ẩm</Text>
          </View>
          <View style={styles.widgetSmall}>
            <Feather name="wind" size={15} color="#B0BEC5" />
            <Text style={styles.smallValue}>{data.current.windSpeed}</Text>
            <Text style={styles.smallLabel}>km/h</Text>
          </View>
          <View style={styles.widgetSmall}>
            <Feather name="sun" size={15} color="#FFB300" />
            <Text style={styles.smallValue}>{Math.round(data.current.uvIndex)}</Text>
            <Text style={styles.smallLabel}>UV</Text>
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
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  note: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.35)",
  },
  card: {
    gap: 10,
  },
  widgetLarge: {
    padding: 16,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  widgetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  widgetCity: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  widgetMain: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  widgetTemp: {
    fontSize: 54,
    lineHeight: 58,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: -3,
  },
  widgetCondition: {
    marginTop: 2,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.62)",
  },
  iconBubble: {
    width: 68,
    height: 68,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4FC3F7",
  },
  widgetFooter: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  footerText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.68)",
  },
  footerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  widgetSmallRow: {
    flexDirection: "row",
    gap: 10,
  },
  widgetSmall: {
    flex: 1,
    minHeight: 84,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.13)",
  },
  smallValue: {
    marginTop: 6,
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  smallLabel: {
    marginTop: 1,
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.45)",
  },
});
