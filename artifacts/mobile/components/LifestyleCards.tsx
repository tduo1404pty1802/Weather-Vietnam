import React, { useEffect, useRef } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WeatherData } from "@/hooks/useWeather";

interface LifestyleItem {
  emoji: string;
  title: string;
  desc: string;
  color: string;
  bg: string;
}

function getLifestyleItems(data: WeatherData): LifestyleItem[] {
  const { humidity, uvIndex, windSpeed, precipitation, feelsLike, weatherCode } =
    data.current;
  const rainProb = data.daily[0]?.precipitationProbabilityMax ?? 0;
  const items: LifestyleItem[] = [];

  const STORM_CODES = [95, 96, 99];
  const RAIN_CODES = [51, 53, 55, 61, 63, 65, 80, 81, 82];

  if (STORM_CODES.includes(weatherCode)) {
    items.push({
      emoji: "⛈️",
      title: "Giông bão",
      desc: "Hạn chế ra ngoài, tránh cây cao",
      color: "#CE93D8",
      bg: "rgba(156,39,176,0.2)",
    });
  }

  if (RAIN_CODES.includes(weatherCode) || rainProb > 60) {
    items.push({
      emoji: "☂️",
      title: "Mang ô",
      desc: `${rainProb}% có mưa hôm nay`,
      color: "#64B5F6",
      bg: "rgba(33,150,243,0.18)",
    });
  }

  if (uvIndex >= 8) {
    items.push({
      emoji: "🧴",
      title: "Chống nắng SPF50+",
      desc: "UV rất cao, bảo vệ da",
      color: "#FFA726",
      bg: "rgba(255,152,0,0.18)",
    });
  } else if (uvIndex >= 5) {
    items.push({
      emoji: "🕶️",
      title: "Đeo kính mát",
      desc: "UV trung bình cao",
      color: "#FFB300",
      bg: "rgba(255,179,0,0.18)",
    });
  }

  if (feelsLike >= 37) {
    items.push({
      emoji: "💧",
      title: "Uống nhiều nước",
      desc: "Cảm giác rất oi bức",
      color: "#EF5350",
      bg: "rgba(239,83,80,0.18)",
    });
  }

  if (feelsLike <= 15) {
    items.push({
      emoji: "🧥",
      title: "Mặc ấm",
      desc: "Trời lạnh dưới 15°C",
      color: "#90CAF9",
      bg: "rgba(144,202,249,0.18)",
    });
  }

  if (windSpeed >= 50) {
    items.push({
      emoji: "🌬️",
      title: "Gió giật mạnh",
      desc: "Cẩn thận biển quảng cáo",
      color: "#B0BEC5",
      bg: "rgba(176,190,197,0.18)",
    });
  }

  if (humidity > 85 && feelsLike > 30) {
    items.push({
      emoji: "😓",
      title: "Rất oi nóng",
      desc: "Độ ẩm cao, khó chịu",
      color: "#FFAB91",
      bg: "rgba(255,138,101,0.18)",
    });
  }

  if (
    !STORM_CODES.includes(weatherCode) &&
    !RAIN_CODES.includes(weatherCode) &&
    rainProb < 25 &&
    feelsLike > 18 &&
    feelsLike < 33 &&
    windSpeed < 30
  ) {
    items.push({
      emoji: "🚴",
      title: "Lý tưởng đạp xe",
      desc: "Thời tiết dễ chịu",
      color: "#A5D6A7",
      bg: "rgba(76,175,80,0.18)",
    });
    if (uvIndex < 6) {
      items.push({
        emoji: "🏃",
        title: "Tốt cho chạy bộ",
        desc: "Sáng sớm hoặc chiều mát",
        color: "#80DEEA",
        bg: "rgba(38,198,218,0.18)",
      });
    }
  }

  if (feelsLike > 28 && !RAIN_CODES.includes(weatherCode) && !STORM_CODES.includes(weatherCode)) {
    items.push({
      emoji: "🧊",
      title: "Uống đồ lạnh",
      desc: "Giải nhiệt ngày oi",
      color: "#81D4FA",
      bg: "rgba(79,195,247,0.18)",
    });
  }

  // Always add at least 2 items
  if (items.length === 0) {
    items.push({
      emoji: "😊",
      title: "Thời tiết tốt",
      desc: "Ngày đẹp để ra ngoài",
      color: "#A5D6A7",
      bg: "rgba(76,175,80,0.18)",
    });
  }

  return items.slice(0, 6);
}

function LifeCard({ item, delay }: { item: LifestyleItem; delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      delay,
      useNativeDriver: true,
      damping: 14,
      stiffness: 120,
    }).start();
  }, []);

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });

  return (
    <Animated.View
      style={[styles.card, { backgroundColor: item.bg, opacity: anim, transform: [{ scale }] }]}
    >
      <Text style={styles.emoji}>{item.emoji}</Text>
      <Text style={[styles.title, { color: item.color }]}>{item.title}</Text>
      <Text style={styles.desc}>{item.desc}</Text>
    </Animated.View>
  );
}

export default function LifestyleCards({ data }: { data: WeatherData }) {
  const items = getLifestyleItems(data);
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Gợi ý hôm nay</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {items.map((item, i) => (
          <LifeCard key={i} item={item} delay={i * 70} />
        ))}
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
    gap: 10,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 16,
    paddingVertical: 14,
    width: 140,
    gap: 5,
  },
  emoji: {
    fontSize: 28,
    marginBottom: 2,
  },
  title: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    lineHeight: 17,
  },
  desc: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.55)",
    lineHeight: 15,
  },
});
