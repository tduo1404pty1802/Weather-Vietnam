import React, { useRef } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { HourlyWeather } from "@/hooks/useWeather";
import { getWeatherInfo } from "@/constants/weatherCodes";
import WeatherIcon from "@/components/WeatherIcon";

interface Props {
  data: HourlyWeather[];
}

function formatHour(timeStr: string): string {
  const d = new Date(timeStr);
  const h = d.getHours();
  return `${h}:00`;
}

const CARD_WIDTH = 64;
const CHART_HEIGHT = 40;

export default function HourlyForecast({ data }: Props) {
  if (!data || data.length === 0) return null;

  const temps = data.map((h) => h.temperature);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const range = Math.max(maxTemp - minTemp, 1);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Dự báo 24 giờ</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {data.map((hour, index) => {
          const info = getWeatherInfo(hour.weatherCode);
          const isCurrent = index === 0;
          const tempNorm = (hour.temperature - minTemp) / range;
          const dotY = CHART_HEIGHT - 8 - tempNorm * (CHART_HEIGHT - 16);

          return (
            <View
              key={hour.time}
              style={[
                styles.hourCard,
                isCurrent && styles.hourCardActive,
              ]}
            >
              <Text
                style={[styles.hourTime, isCurrent && styles.activeText]}
                numberOfLines={1}
              >
                {index === 0 ? "Giờ này" : formatHour(hour.time)}
              </Text>

              <WeatherIcon
                iconName={info.icon}
                size={20}
                color={isCurrent ? "#0B1D3A" : "rgba(255,255,255,0.85)"}
              />

              {/* Mini chart dot */}
              <View style={[styles.chartArea, { height: CHART_HEIGHT }]}>
                <View
                  style={[
                    styles.chartDot,
                    {
                      top: dotY,
                      backgroundColor: isCurrent ? "#0B1D3A" : "#4FC3F7",
                    },
                  ]}
                />
                <View
                  style={[
                    styles.chartBar,
                    {
                      height: tempNorm * (CHART_HEIGHT - 16) + 4,
                      backgroundColor: isCurrent
                        ? "rgba(11,29,58,0.2)"
                        : "rgba(79,195,247,0.15)",
                    },
                  ]}
                />
              </View>

              {hour.precipitationProbability > 15 && (
                <Text
                  style={[
                    styles.rainChance,
                    isCurrent && styles.rainChanceActive,
                  ]}
                >
                  {hour.precipitationProbability}%
                </Text>
              )}

              <Text
                style={[styles.hourTemp, isCurrent && styles.activeText]}
              >
                {hour.temperature}°
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  scroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  hourCard: {
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.09)",
    width: CARD_WIDTH,
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  hourCardActive: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderColor: "transparent",
  },
  hourTime: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.6)",
  },
  activeText: {
    color: "#0B1D3A",
  },
  chartArea: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative",
    marginVertical: 2,
  },
  chartDot: {
    position: "absolute",
    width: 5,
    height: 5,
    borderRadius: 2.5,
    zIndex: 2,
  },
  chartBar: {
    width: 3,
    borderRadius: 1.5,
    alignSelf: "center",
  },
  rainChance: {
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    color: "#81D4FA",
  },
  rainChanceActive: {
    color: "#1565C0",
  },
  hourTemp: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
});
