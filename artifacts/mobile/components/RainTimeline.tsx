import { Feather } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { HourlyWeather } from "@/hooks/useWeather";

interface Props {
  data: HourlyWeather[];
}

function formatHour(time: string) {
  const date = new Date(time);
  return `${date.getHours().toString().padStart(2, "0")}h`;
}

function getRainColor(probability: number) {
  if (probability >= 75) return "#1565C0";
  if (probability >= 50) return "#4FC3F7";
  if (probability >= 25) return "#81D4FA";
  return "rgba(255,255,255,0.18)";
}

function getSummary(hours: HourlyWeather[]) {
  const peak = hours.reduce((best, item) =>
    item.precipitationProbability > best.precipitationProbability ? item : best,
  hours[0]);

  if (!peak || peak.precipitationProbability < 20) {
    return {
      icon: "sun" as keyof typeof Feather.glyphMap,
      title: "Mưa thấp trong 12 giờ tới",
      desc: "Bạn có thể ra ngoài khá thoải mái.",
      color: "#A5D6A7",
    };
  }

  return {
    icon: "cloud-rain" as keyof typeof Feather.glyphMap,
    title: `Đỉnh mưa lúc ${formatHour(peak.time)}`,
    desc: `Xác suất cao nhất ${peak.precipitationProbability}% trong 12 giờ tới.`,
    color: getRainColor(peak.precipitationProbability),
  };
}

export default function RainTimeline({ data }: Props) {
  const anim = useRef(new Animated.Value(0)).current;
  const hours = useMemo(() => data.slice(0, 12), [data]);
  const summary = useMemo(() => getSummary(hours), [hours]);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 650,
      useNativeDriver: true,
    }).start();
  }, [anim]);

  if (hours.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Timeline mưa</Text>
      <Animated.View style={[styles.card, { opacity: anim }]}> 
        <View style={styles.summaryRow}>
          <View style={[styles.iconBg, { backgroundColor: `${summary.color}24` }]}>
            <Feather name={summary.icon} size={17} color={summary.color} />
          </View>
          <View style={styles.summaryText}>
            <Text style={styles.summaryTitle}>{summary.title}</Text>
            <Text style={styles.summaryDesc}>{summary.desc}</Text>
          </View>
        </View>

        <View style={styles.timeline}>
          {hours.map((hour, index) => {
            const height = 12 + Math.max(6, hour.precipitationProbability * 0.46);
            return (
              <View key={`${hour.time}-${index}`} style={styles.barItem}>
                <View style={styles.barShell}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height,
                        backgroundColor: getRainColor(hour.precipitationProbability),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.hourText}>{index % 2 === 0 ? formatHour(hour.time) : ""}</Text>
              </View>
            );
          })}
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
    borderColor: "rgba(255,255,255,0.13)",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryText: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  summaryDesc: {
    marginTop: 2,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.5)",
  },
  timeline: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 78,
  },
  barItem: {
    flex: 1,
    alignItems: "center",
  },
  barShell: {
    height: 56,
    justifyContent: "flex-end",
  },
  bar: {
    width: 10,
    borderRadius: 999,
  },
  hourText: {
    marginTop: 6,
    height: 12,
    fontSize: 9,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.42)",
  },
});
