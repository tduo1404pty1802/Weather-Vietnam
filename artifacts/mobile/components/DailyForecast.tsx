import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { DailyWeather } from "@/hooks/useWeather";
import { getWeatherInfo, getUvLevel } from "@/constants/weatherCodes";
import WeatherIcon from "@/components/WeatherIcon";

interface Props {
  data: DailyWeather[];
}

const DAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function getDayLabel(dateStr: string, index: number): string {
  if (index === 0) return "Hôm nay";
  if (index === 1) return "Ngày mai";
  const d = new Date(dateStr);
  return DAYS[d.getDay()];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

interface RowProps {
  day: DailyWeather;
  index: number;
  barStart: number;
  barWidth: number;
}

function DayRow({ day, index, barStart, barWidth }: RowProps) {
  const info = getWeatherInfo(day.weatherCode);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;
  const barAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = index * 60;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(barAnim, {
        toValue: 1,
        duration: 600,
        delay: delay + 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const barWidthAnimated = barAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", `${Math.max(barWidth * 100, 10)}%`],
  });

  const barMargin = barAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", `${barStart * 100}%`],
  });

  const isToday = index === 0;

  return (
    <Animated.View
      style={[
        styles.dayRow,
        index !== 0 && { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" },
        { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
      ]}
    >
      <View style={styles.dayLeft}>
        <Text style={[styles.dayName, isToday && styles.todayText]}>
          {getDayLabel(day.date, index)}
        </Text>
        <Text style={styles.dayDate}>{formatDate(day.date)}</Text>
      </View>
      <View style={styles.iconWrapper}>
        <WeatherIcon
          iconName={info.icon}
          size={18}
          color={isToday ? "#4FC3F7" : "rgba(255,255,255,0.75)"}
        />
        {day.precipitationProbabilityMax > 15 && (
          <Text style={styles.rainPct}>
            {day.precipitationProbabilityMax}%
          </Text>
        )}
      </View>
      <Text style={styles.tempMin}>{day.tempMin}°</Text>
      <View style={styles.barContainer}>
        <View style={styles.barTrack}>
          <Animated.View
            style={[
              styles.barFill,
              {
                marginLeft: barMargin as unknown as string,
                width: barWidthAnimated as unknown as string,
                backgroundColor: isToday ? "#4FC3F7" : "rgba(255,255,255,0.4)",
              },
            ]}
          />
        </View>
      </View>
      <Text style={[styles.tempMax, isToday && { color: "#FFFFFF" }]}>
        {day.tempMax}°
      </Text>
      <View style={styles.precipWrapper}>
        {day.precipitationSum > 0 ? (
          <Text style={styles.precipText}>{day.precipitationSum.toFixed(1)}<Text style={styles.precipUnit}>mm</Text></Text>
        ) : (
          <Text style={styles.precipDash}>–</Text>
        )}
      </View>
      {day.uvIndexMax >= 6 && (
        <View style={[styles.uvBadge, { backgroundColor: getUvLevel(day.uvIndexMax).color + "33" }]}>
          <Text style={[styles.uvBadgeText, { color: getUvLevel(day.uvIndexMax).color }]}>
            UV{Math.round(day.uvIndexMax)}
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

export default function DailyForecast({ data }: Props) {
  if (!data || data.length === 0) return null;

  const maxTemp = Math.max(...data.map((d) => d.tempMax));
  const minTemp = Math.min(...data.map((d) => d.tempMin));
  const range = Math.max(maxTemp - minTemp, 1);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Dự báo 7 ngày</Text>
      <View style={styles.card}>
        {data.map((day, index) => {
          const barStart = (day.tempMin - minTemp) / range;
          const barWidth = (day.tempMax - day.tempMin) / range;
          return (
            <DayRow
              key={day.date}
              day={day}
              index={index}
              barStart={barStart}
              barWidth={barWidth}
            />
          );
        })}
      </View>
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
    overflow: "hidden",
  },
  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dayLeft: {
    width: 76,
  },
  dayName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.8)",
  },
  todayText: {
    color: "#FFFFFF",
  },
  dayDate: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.4)",
    marginTop: 1,
  },
  iconWrapper: {
    width: 42,
    alignItems: "center",
    gap: 2,
  },
  rainPct: {
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    color: "#81D4FA",
  },
  tempMin: {
    width: 32,
    textAlign: "right",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.4)",
  },
  barContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  barTrack: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 2,
    overflow: "hidden",
    flexDirection: "row",
  },
  barFill: {
    height: 4,
    borderRadius: 2,
  },
  tempMax: {
    width: 32,
    textAlign: "left",
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: "rgba(255,255,255,0.75)",
  },
  precipWrapper: {
    width: 38,
    alignItems: "flex-end",
  },
  precipText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#81D4FA",
  },
  precipUnit: {
    fontSize: 9,
    fontFamily: "Inter_400Regular",
    color: "rgba(129,212,250,0.7)",
  },
  precipDash: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.2)",
  },
  uvBadge: {
    marginLeft: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
  },
  uvBadgeText: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.3,
  },
});
