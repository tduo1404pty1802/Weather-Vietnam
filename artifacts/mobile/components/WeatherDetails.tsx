import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { getUvLevel, getWindDirection } from "@/constants/weatherCodes";

interface Props {
  humidity: number;
  windSpeed: number;
  windDirection: number;
  uvIndex: number;
  visibility: number;
  pressure: number;
  precipitation: number;
  feelsLike: number;
}

interface CardProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  subColor?: string;
  progress?: number;
  progressColor?: string;
  cardWidth: number;
  delay?: number;
}

function DetailCard({
  icon,
  label,
  value,
  unit,
  sub,
  subColor,
  progress,
  progressColor,
  cardWidth,
  delay = 0,
}: CardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay,
        useNativeDriver: true,
        damping: 14,
        stiffness: 120,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.card,
        { width: cardWidth, opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconBg}>
          <Feather name={icon} size={15} color="rgba(255,255,255,0.85)" />
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={styles.value}>
        {value}
        {unit ? <Text style={styles.unit}> {unit}</Text> : null}
      </Text>
      {progress !== undefined && (
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(progress * 100, 100)}%`,
                backgroundColor: progressColor ?? "#4FC3F7",
              },
            ]}
          />
        </View>
      )}
      {sub ? (
        <Text style={[styles.sub, subColor ? { color: subColor } : undefined]}>
          {sub}
        </Text>
      ) : null}
    </Animated.View>
  );
}

function WindCompass({ degrees, cardWidth }: { degrees: number; cardWidth: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, delay: 200, useNativeDriver: true }),
      Animated.timing(rotateAnim, { toValue: degrees, duration: 800, delay: 200, useNativeDriver: true }),
    ]).start();
  }, [degrees]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  const dir = getWindDirection(degrees);

  return (
    <Animated.View style={[styles.card, { width: cardWidth, opacity: fadeAnim }]}>
      <View style={styles.cardHeader}>
        <View style={styles.iconBg}>
          <Feather name="wind" size={15} color="rgba(255,255,255,0.85)" />
        </View>
        <Text style={styles.label}>Hướng gió</Text>
      </View>
      <View style={styles.compassContainer}>
        <View style={styles.compassRing}>
          {["B", "Đ", "N", "T"].map((d, i) => (
            <Text
              key={d}
              style={[
                styles.compassLabel,
                {
                  top: i === 0 ? 2 : i === 2 ? undefined : 18,
                  bottom: i === 2 ? 2 : undefined,
                  left: i === 3 ? 2 : i === 1 ? undefined : "50%",
                  right: i === 1 ? 2 : undefined,
                  transform: i === 0 || i === 2 ? [{ translateX: -4 }] : [{ translateY: -7 }],
                },
              ]}
            >
              {d}
            </Text>
          ))}
          <Animated.View style={[styles.needle, { transform: [{ rotate }] }]}>
            <View style={styles.needleTop} />
            <View style={styles.needleBottom} />
          </Animated.View>
        </View>
        <Text style={styles.value}>{dir}</Text>
      </View>
    </Animated.View>
  );
}

export default function WeatherDetails({
  humidity,
  windSpeed,
  windDirection,
  uvIndex,
  visibility,
  pressure,
  precipitation,
  feelsLike,
}: Props) {
  const { width } = useWindowDimensions();
  const cardWidth = Math.floor((width - 40 - 10) / 2);
  const uvLevel = getUvLevel(uvIndex);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Chi tiết thời tiết</Text>
      <View style={styles.grid}>
        <DetailCard
          icon="droplet"
          label="Độ ẩm"
          value={`${humidity}%`}
          progress={humidity / 100}
          progressColor={
            humidity > 80 ? "#EF5350" : humidity < 40 ? "#FFC107" : "#4FC3F7"
          }
          sub={humidity > 80 ? "Cao - Oi bức" : humidity < 40 ? "Thấp - Khô" : "Vừa"}
          subColor={
            humidity > 80 ? "#EF5350" : humidity < 40 ? "#FFC107" : "#4CAF50"
          }
          cardWidth={cardWidth}
          delay={0}
        />
        <DetailCard
          icon="wind"
          label="Tốc độ gió"
          value={`${windSpeed}`}
          unit="km/h"
          sub={
            windSpeed < 20
              ? "Gió nhẹ"
              : windSpeed < 40
              ? "Gió vừa"
              : windSpeed < 60
              ? "Gió mạnh"
              : "Bão"
          }
          cardWidth={cardWidth}
          delay={60}
        />
        <DetailCard
          icon="sun"
          label="Chỉ số UV"
          value={uvIndex.toFixed(1)}
          progress={Math.min(uvIndex / 11, 1)}
          progressColor={uvLevel.color}
          sub={uvLevel.label}
          subColor={uvLevel.color}
          cardWidth={cardWidth}
          delay={120}
        />
        <DetailCard
          icon="eye"
          label="Tầm nhìn"
          value={`${visibility}`}
          unit="km"
          sub={
            visibility < 1
              ? "Rất thấp - Nguy hiểm"
              : visibility < 5
              ? "Thấp"
              : visibility < 10
              ? "Trung bình"
              : "Tốt"
          }
          cardWidth={cardWidth}
          delay={180}
        />
        <DetailCard
          icon="activity"
          label="Áp suất"
          value={`${pressure}`}
          unit="hPa"
          sub={pressure > 1013 ? "Cao áp" : pressure < 1000 ? "Thấp áp" : "Bình thường"}
          cardWidth={cardWidth}
          delay={240}
        />
        <DetailCard
          icon="thermometer"
          label="Cảm giác như"
          value={`${feelsLike}°C`}
          sub={feelsLike > 35 ? "Rất nóng" : feelsLike > 28 ? "Nóng" : feelsLike < 15 ? "Lạnh" : "Dễ chịu"}
          cardWidth={cardWidth}
          delay={300}
        />
        <DetailCard
          icon="cloud-rain"
          label="Lượng mưa"
          value={`${precipitation}`}
          unit="mm"
          sub="1 giờ qua"
          cardWidth={cardWidth}
          delay={360}
        />
        <WindCompass degrees={windDirection} cardWidth={cardWidth} />
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.09)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.13)",
    padding: 16,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  iconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.55)",
  },
  value: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  unit: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 0,
  },
  progressTrack: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 2,
    marginTop: 10,
    marginBottom: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: 3,
    borderRadius: 2,
  },
  sub: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.5)",
    marginTop: 4,
  },
  compassContainer: {
    alignItems: "center",
    gap: 8,
  },
  compassRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  compassLabel: {
    position: "absolute",
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.5)",
  },
  needle: {
    width: 2,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  needleTop: {
    width: 2,
    height: 20,
    backgroundColor: "#4FC3F7",
    borderRadius: 1,
  },
  needleBottom: {
    width: 2,
    height: 20,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 1,
  },
});
