import { Feather } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef } from "react";
import { Animated, ScrollView, StyleSheet, Text, View } from "react-native";

import { HourlyWeather, WeatherData } from "@/hooks/useWeather";

interface Props {
  data: WeatherData;
}

interface ActivityDefinition {
  key: string;
  icon: keyof typeof Feather.glyphMap;
  title: string;
  targetTemp: number;
  maxRain: number;
  maxWind: number;
  tempWeight: number;
  rainWeight: number;
  windWeight: number;
  color: string;
}

interface ActivityPlan extends ActivityDefinition {
  hour: HourlyWeather;
  score: number;
  verdict: string;
}

const ACTIVITIES: ActivityDefinition[] = [
  {
    key: "run",
    icon: "activity",
    title: "Chạy bộ",
    targetTemp: 25,
    maxRain: 25,
    maxWind: 22,
    tempWeight: 5.2,
    rainWeight: 0.9,
    windWeight: 1.7,
    color: "#80DEEA",
  },
  {
    key: "commute",
    icon: "briefcase",
    title: "Đi làm",
    targetTemp: 28,
    maxRain: 35,
    maxWind: 35,
    tempWeight: 3.6,
    rainWeight: 1.15,
    windWeight: 1.1,
    color: "#4FC3F7",
  },
  {
    key: "laundry",
    icon: "sun",
    title: "Phơi đồ",
    targetTemp: 31,
    maxRain: 12,
    maxWind: 26,
    tempWeight: 2.2,
    rainWeight: 1.8,
    windWeight: 0.8,
    color: "#FFB300",
  },
  {
    key: "photo",
    icon: "camera",
    title: "Chụp ảnh",
    targetTemp: 27,
    maxRain: 20,
    maxWind: 24,
    tempWeight: 3.8,
    rainWeight: 1.2,
    windWeight: 1.0,
    color: "#CE93D8",
  },
  {
    key: "coffee",
    icon: "coffee",
    title: "Cà phê ngoài trời",
    targetTemp: 27,
    maxRain: 30,
    maxWind: 24,
    tempWeight: 3.2,
    rainWeight: 1.0,
    windWeight: 1.1,
    color: "#A5D6A7",
  },
  {
    key: "picnic",
    icon: "map",
    title: "Picnic",
    targetTemp: 26,
    maxRain: 18,
    maxWind: 22,
    tempWeight: 4.4,
    rainWeight: 1.5,
    windWeight: 1.4,
    color: "#FFAB91",
  },
];

function formatHour(time: string) {
  const date = new Date(time);
  return `${date.getHours().toString().padStart(2, "0")}:00`;
}

function scoreHour(activity: ActivityDefinition, hour: HourlyWeather) {
  const tempPenalty = Math.abs(hour.temperature - activity.targetTemp) * activity.tempWeight;
  const rainPenalty = Math.max(hour.precipitationProbability - activity.maxRain, 0) * activity.rainWeight;
  const windPenalty = Math.max(hour.windSpeed - activity.maxWind, 0) * activity.windWeight;
  const raw = 100 - tempPenalty - rainPenalty - windPenalty;
  return Math.round(Math.max(0, Math.min(100, raw)));
}

function getVerdict(score: number, hour: HourlyWeather) {
  if (score >= 86) return `Rất hợp · mưa ${hour.precipitationProbability}%`;
  if (score >= 70) return `Khá ổn · ${hour.temperature}°C`;
  if (score >= 50) return `Tạm được · cần cân nhắc`;
  return `Không lý tưởng · mưa/gió cao`;
}

function buildPlans(data: WeatherData): ActivityPlan[] {
  const hours = data.hourly.slice(0, 18);
  if (hours.length === 0) return [];

  return ACTIVITIES.map((activity) => {
    const best = hours.reduce(
      (winner, hour) => {
        const score = scoreHour(activity, hour);
        return score > winner.score ? { hour, score } : winner;
      },
      { hour: hours[0], score: scoreHour(activity, hours[0]) },
    );

    return {
      ...activity,
      hour: best.hour,
      score: best.score,
      verdict: getVerdict(best.score, best.hour),
    };
  }).sort((a, b) => b.score - a.score);
}

function ActivityCard({ plan, index }: { plan: ActivityPlan; index: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      delay: index * 65,
      damping: 16,
      stiffness: 120,
      useNativeDriver: true,
    }).start();
  }, [anim, index]);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });
  const progressWidth = `${plan.score}%`;

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: anim,
          borderColor: `${plan.color}40`,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconBg, { backgroundColor: `${plan.color}25` }]}>
          <Feather name={plan.icon} size={16} color={plan.color} />
        </View>
        <Text style={[styles.score, { color: plan.color }]}>{plan.score}</Text>
      </View>
      <Text style={styles.title}>{plan.title}</Text>
      <Text style={[styles.time, { color: plan.color }]}>{formatHour(plan.hour.time)}</Text>
      <Text style={styles.verdict}>{plan.verdict}</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: progressWidth, backgroundColor: plan.color }]} />
      </View>
    </Animated.View>
  );
}

export default function ActivityPlanner({ data }: Props) {
  const plans = useMemo(() => buildPlans(data), [data]);
  if (plans.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.sectionTitle}>Lên kế hoạch hôm nay</Text>
        <Text style={styles.helperText}>18h tới</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {plans.map((plan, index) => (
          <ActivityCard key={plan.key} plan={plan} index={index} />
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
    paddingHorizontal: 20,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  helperText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.35)",
  },
  scroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  card: {
    width: 148,
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBg: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  score: {
    fontSize: 24,
    lineHeight: 28,
    fontFamily: "Inter_700Bold",
  },
  title: {
    marginTop: 13,
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  time: {
    marginTop: 5,
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  verdict: {
    marginTop: 4,
    minHeight: 32,
    fontSize: 11,
    lineHeight: 16,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.55)",
  },
  progressTrack: {
    marginTop: 11,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.11)",
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
});
