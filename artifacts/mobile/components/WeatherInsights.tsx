import { Feather } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef } from "react";
import { Animated, ScrollView, StyleSheet, Text, View } from "react-native";

import { WeatherData } from "@/hooks/useWeather";

interface Props {
  data: WeatherData;
}

interface InsightItem {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  value: string;
  desc: string;
  color: string;
  bg: string;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function formatHour(time: string) {
  const d = new Date(time);
  return `${d.getHours().toString().padStart(2, "0")}:00`;
}

function getComfortScore(data: WeatherData) {
  const { feelsLike, humidity, windSpeed, uvIndex } = data.current;
  const rainProb = data.daily[0]?.precipitationProbabilityMax ?? 0;

  const tempScore = 100 - Math.min(Math.abs(feelsLike - 27) * 7, 55);
  const humidityScore = 100 - Math.min(Math.abs(humidity - 60) * 1.3, 45);
  const windScore = 100 - Math.min(Math.max(windSpeed - 12, 0) * 2.5, 35);
  const uvScore = 100 - Math.min(Math.max(uvIndex - 5, 0) * 7, 35);
  const rainScore = 100 - Math.min(rainProb * 0.55, 45);

  return Math.round(
    clamp(
      tempScore * 0.34 + humidityScore * 0.22 + windScore * 0.16 + uvScore * 0.12 + rainScore * 0.16,
      0,
      100
    )
  );
}

function getComfortLabel(score: number) {
  if (score >= 86) return { label: "Rất dễ chịu", emoji: "✨", color: "#A5D6A7" };
  if (score >= 70) return { label: "Khá ổn", emoji: "😊", color: "#80DEEA" };
  if (score >= 50) return { label: "Tạm được", emoji: "🙂", color: "#FFB300" };
  return { label: "Khó chịu", emoji: "😵", color: "#EF5350" };
}

function findBestHour(data: WeatherData) {
  const candidates = data.hourly.slice(0, 18);
  if (candidates.length === 0) return null;

  return candidates.reduce((best, hour) => {
    const tempPenalty = Math.abs(hour.temperature - 27) * 5;
    const rainPenalty = hour.precipitationProbability * 0.9;
    const windPenalty = Math.max(hour.windSpeed - 16, 0) * 2;
    const score = 100 - tempPenalty - rainPenalty - windPenalty;
    if (!best || score > best.score) return { hour, score };
    return best;
  }, null as null | { hour: WeatherData["hourly"][number]; score: number });
}

function getRainWindow(data: WeatherData) {
  const rainy = data.hourly.find((hour) => hour.precipitationProbability >= 45);
  if (!rainy) return null;
  return rainy;
}

function buildInsights(data: WeatherData): InsightItem[] {
  const score = getComfortScore(data);
  const comfort = getComfortLabel(score);
  const best = findBestHour(data);
  const rain = getRainWindow(data);
  const { uvIndex, windSpeed, feelsLike, humidity } = data.current;

  const items: InsightItem[] = [
    {
      icon: "heart",
      title: "Điểm dễ chịu",
      value: `${comfort.emoji} ${score}/100`,
      desc: comfort.label,
      color: comfort.color,
      bg: `${comfort.color}22`,
    },
  ];

  if (best) {
    items.push({
      icon: "clock",
      title: "Giờ đẹp nhất",
      value: formatHour(best.hour.time),
      desc: `${best.hour.temperature}°C · mưa ${best.hour.precipitationProbability}%`,
      color: "#4FC3F7",
      bg: "rgba(79,195,247,0.16)",
    });
  }

  items.push(
    rain
      ? {
          icon: "cloud-rain",
          title: "Khả năng mưa",
          value: `Từ ${formatHour(rain.time)}`,
          desc: `Xác suất ${rain.precipitationProbability}%`,
          color: "#81D4FA",
          bg: "rgba(129,212,250,0.16)",
        }
      : {
          icon: "umbrella",
          title: "Mưa hôm nay",
          value: "Ít khả năng",
          desc: "Có thể ra ngoài nhẹ nhàng",
          color: "#A5D6A7",
          bg: "rgba(165,214,167,0.16)",
        }
  );

  if (uvIndex >= 8) {
    items.push({
      icon: "sun",
      title: "Da & UV",
      value: "Che chắn kỹ",
      desc: `UV ${Math.round(uvIndex)} rất cao`,
      color: "#FFB300",
      bg: "rgba(255,179,0,0.16)",
    });
  } else if (windSpeed >= 35) {
    items.push({
      icon: "wind",
      title: "Gió ngoài trời",
      value: "Cẩn thận",
      desc: `${windSpeed} km/h, tránh vật nhẹ`,
      color: "#B0BEC5",
      bg: "rgba(176,190,197,0.16)",
    });
  } else if (feelsLike >= 35 || humidity >= 85) {
    items.push({
      icon: "droplet",
      title: "Cơ thể",
      value: "Dễ mất nước",
      desc: `Cảm giác ${feelsLike}°C · ẩm ${humidity}%`,
      color: "#FFAB91",
      bg: "rgba(255,171,145,0.16)",
    });
  } else {
    items.push({
      icon: "coffee",
      title: "Kế hoạch",
      value: "Hợp đi dạo",
      desc: "Thời tiết đủ ổn để ra ngoài",
      color: "#CE93D8",
      bg: "rgba(206,147,216,0.16)",
    });
  }

  return items;
}

function InsightCard({ item, index }: { item: InsightItem; index: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      delay: index * 80,
      damping: 16,
      stiffness: 120,
      useNativeDriver: true,
    }).start();
  }, [anim, index]);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] });

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: item.bg,
          borderColor: `${item.color}40`,
          opacity: anim,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      <View style={[styles.iconBg, { backgroundColor: `${item.color}24` }]}>
        <Feather name={item.icon} size={16} color={item.color} />
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={[styles.cardValue, { color: item.color }]}>{item.value}</Text>
      <Text style={styles.cardDesc}>{item.desc}</Text>
    </Animated.View>
  );
}

export default function WeatherInsights({ data }: Props) {
  const insights = useMemo(() => buildInsights(data), [data]);

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.sectionTitle}>Thông minh hôm nay</Text>
        <Text style={styles.spark}>AI-ish</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {insights.map((item, index) => (
          <InsightCard key={`${item.title}-${item.value}`} item={item} index={index} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  spark: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    color: "rgba(255,255,255,0.35)",
    letterSpacing: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  card: {
    width: 142,
    minHeight: 142,
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
  },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.55)",
  },
  cardValue: {
    marginTop: 4,
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  cardDesc: {
    marginTop: 5,
    fontSize: 11,
    lineHeight: 15,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.58)",
  },
});
