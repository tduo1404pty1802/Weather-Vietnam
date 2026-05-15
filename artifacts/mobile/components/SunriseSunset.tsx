import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View, useWindowDimensions } from "react-native";

interface Props {
  sunrise: string;
  sunset: string;
}

function timeToMinutes(timeStr: string): number {
  const d = new Date(timeStr);
  return d.getHours() * 60 + d.getMinutes();
}

function formatTime(timeStr: string): string {
  const d = new Date(timeStr);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export default function SunriseSunset({ sunrise, sunset }: Props) {
  const { width } = useWindowDimensions();
  const arcWidth = width - 40;
  const arcHeight = 90;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const sunriseMin = timeToMinutes(sunrise);
  const sunsetMin = timeToMinutes(sunset);
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  const totalMin = sunsetMin - sunriseMin;
  const elapsedMin = Math.max(0, Math.min(nowMin - sunriseMin, totalMin));
  const rawProgress = totalMin > 0 ? elapsedMin / totalMin : 0;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: rawProgress,
      duration: 1000,
      delay: 300,
      useNativeDriver: false,
    }).start();
  }, [rawProgress]);

  const dayDuration = totalMin;
  const hours = Math.floor(dayDuration / 60);
  const mins = dayDuration % 60;

  // Tính thời gian còn lại đến sự kiện tiếp theo
  function getNextEventLabel(): string {
    const now = Date.now();
    const sr = new Date(sunrise).getTime();
    const ss = new Date(sunset).getTime();
    if (now < sr) {
      const diffMin = Math.round((sr - now) / 60000);
      const h = Math.floor(diffMin / 60);
      const m = diffMin % 60;
      return h > 0 ? `Mặt trời mọc sau ${h}g ${m}p` : `Mặt trời mọc sau ${m} phút`;
    }
    if (now < ss) {
      const diffMin = Math.round((ss - now) / 60000);
      const h = Math.floor(diffMin / 60);
      const m = diffMin % 60;
      return h > 0 ? `Mặt trời lặn sau ${h}g ${m}p` : `Mặt trời lặn sau ${m} phút`;
    }
    return "Đã lặn hôm nay";
  }

  const nextEventLabel = getNextEventLabel();

  const sunX = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [18, arcWidth - 18],
  });

  const sunY = progressAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [arcHeight - 16, 14, arcHeight - 16],
  });

  return (
    <View style={[styles.container, { marginHorizontal: 20 }]}>
      <Text style={styles.sectionTitle}>Mặt trời</Text>
      <View
        style={[
          styles.card,
          { paddingBottom: 16 },
        ]}
      >
        <View style={{ width: arcWidth - 32, height: arcHeight, position: "relative" }}>
          <View style={styles.arcTrack} />
          <Animated.View
            style={[
              styles.sunDot,
              {
                transform: [
                  { translateX: sunX as unknown as number },
                  { translateY: sunY as unknown as number },
                ],
              },
            ]}
          >
            <View style={styles.sunInner} />
          </Animated.View>
          <View style={styles.arcLabels}>
            <Text style={styles.arcTime}>{formatTime(sunrise)}</Text>
            <Text style={styles.arcTime}>{formatTime(sunset)}</Text>
          </View>
          <View style={styles.arcSubLabels}>
            <Text style={styles.arcSub}>Mặt trời mọc</Text>
            <Text style={styles.arcSub}>Mặt trời lặn</Text>
          </View>
        </View>
        <View style={styles.dayDuration}>
          <Text style={styles.durationLabel}>Ban ngày</Text>
          <Text style={styles.durationValue}>
            {hours} giờ {mins} phút
          </Text>
        </View>
        <View style={styles.nextEvent}>
          <Text style={styles.nextEventText}>{nextEventLabel}</Text>
        </View>
      </View>
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
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.09)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.13)",
    padding: 16,
    alignItems: "center",
    gap: 12,
  },
  arcTrack: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    height: 1.5,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 1,
  },
  sunDot: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,179,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -12,
    marginTop: -12,
  },
  sunInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FFB300",
  },
  arcLabels: {
    position: "absolute",
    bottom: 4,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  arcSubLabels: {
    position: "absolute",
    bottom: -14,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  arcTime: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  arcSub: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.45)",
  },
  dayDuration: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 18,
  },
  durationLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.5)",
  },
  durationValue: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#FFB300",
  },
  nextEvent: {
    alignItems: "center",
    marginTop: 2,
  },
  nextEventText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.45)",
  },
});
