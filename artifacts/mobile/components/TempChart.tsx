import React, { useEffect, useRef } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Svg, { Defs, LinearGradient, Stop, Path, Circle } from "react-native-svg";
import { HourlyWeather } from "@/hooks/useWeather";
import { getWeatherInfo } from "@/constants/weatherCodes";
import WeatherIcon from "@/components/WeatherIcon";

interface Props {
  data: HourlyWeather[];
}

const CHART_HEIGHT = 60;
const CARD_W = 58;
const CARD_GAP = 8;

function formatHour(timeStr: string): string {
  const d = new Date(timeStr);
  return `${d.getHours()}:00`;
}

export default function TempChart({ data }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      delay: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  if (!data || data.length === 0) return null;

  const temps = data.map((h) => h.temperature);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const range = Math.max(maxTemp - minTemp, 1);

  const totalWidth = (CARD_W + CARD_GAP) * data.length + 32;

  const points = data.map((item, i) => {
    const x = 16 + i * (CARD_W + CARD_GAP) + CARD_W / 2;
    const normY = (item.temperature - minTemp) / range;
    const y = CHART_HEIGHT - 8 - normY * (CHART_HEIGHT - 20);
    return { x, y };
  });

  // Build smooth bezier curve path
  function buildLinePath(): string {
    return [
      `M ${points[0].x} ${points[0].y}`,
      ...points.slice(1).map((p, i) => {
        const cx = (points[i].x + p.x) / 2;
        return `C ${cx} ${points[i].y} ${cx} ${p.y} ${p.x} ${p.y}`;
      }),
    ].join(" ");
  }

  function buildFillPath(): string {
    return [
      `M ${points[0].x} ${CHART_HEIGHT}`,
      `L ${points[0].x} ${points[0].y}`,
      ...points.slice(1).map((p, i) => {
        const cx = (points[i].x + p.x) / 2;
        return `C ${cx} ${points[i].y} ${cx} ${p.y} ${p.x} ${p.y}`;
      }),
      `L ${points[points.length - 1].x} ${CHART_HEIGHT}`,
      "Z",
    ].join(" ");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Dự báo 24 giờ</Text>
      <Animated.View style={[styles.outer, { opacity: fadeAnim }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
        >
          <View style={{ width: totalWidth }}>
            {/* SVG Chart */}
            <Svg
              width={totalWidth}
              height={CHART_HEIGHT}
              style={styles.chartSvg}
              pointerEvents="none"
            >
              <Defs>
                <LinearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#4FC3F7" stopOpacity={0.45} />
                  <Stop offset="100%" stopColor="#4FC3F7" stopOpacity={0} />
                </LinearGradient>
              </Defs>
              {/* Fill area */}
              <Path d={buildFillPath()} fill="url(#tempGrad)" />
              {/* Curve line */}
              <Path
                d={buildLinePath()}
                fill="none"
                stroke="rgba(79,195,247,0.85)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Dots */}
              {points.map((p, i) => (
                <Circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={i === 0 ? 4.5 : 3}
                  fill={i === 0 ? "#4FC3F7" : "rgba(79,195,247,0.65)"}
                />
              ))}
            </Svg>

            {/* Hour cards row */}
            <View style={styles.cardsRow}>
              {data.map((hour, index) => {
                const info = getWeatherInfo(hour.weatherCode);
                const isCurrent = index === 0;
                return (
                  <View
                    key={hour.time}
                    style={[styles.hourCard, isCurrent && styles.hourCardActive]}
                  >
                    <Text style={[styles.hourTime, isCurrent && styles.activeText]}>
                      {index === 0 ? "Giờ này" : formatHour(hour.time)}
                    </Text>
                    <WeatherIcon
                      iconName={info.icon}
                      size={17}
                      color={isCurrent ? "#0B1D3A" : "rgba(255,255,255,0.75)"}
                    />
                    {hour.precipitationProbability > 15 && (
                      <Text style={[styles.rainPct, isCurrent && { color: "#1565C0" }]}>
                        {hour.precipitationProbability}%
                      </Text>
                    )}
                    <Text style={[styles.hourTemp, isCurrent && styles.activeText]}>
                      {hour.temperature}°
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </Animated.View>
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
  outer: {
    overflow: "hidden",
  },
  chartSvg: {
    display: "flex",
  },
  cardsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: CARD_GAP,
  },
  hourCard: {
    width: CARD_W,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.07)",
    gap: 5,
  },
  hourCardActive: {
    backgroundColor: "#4FC3F7",
  },
  hourTime: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
  },
  activeText: {
    color: "#0B1D3A",
    fontFamily: "Inter_700Bold",
  },
  rainPct: {
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    color: "#81D4FA",
  },
  hourTemp: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
});
