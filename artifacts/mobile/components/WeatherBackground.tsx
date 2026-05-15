import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { getWeatherInfo, isNightTime } from "@/constants/weatherCodes";
import WeatherParticles from "@/components/WeatherParticles";

interface Props {
  weatherCode: number;
  children: React.ReactNode;
  sunrise?: string;
  sunset?: string;
}

export default function WeatherBackground({ weatherCode, children, sunrise, sunset }: Props) {
  const info = getWeatherInfo(weatherCode);
  const hour = new Date().getHours();
  const night = isNightTime(hour, sunrise, sunset);
  const gradient = night ? info.gradients.night : info.gradients.day;

  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 8000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmer]);

  const translateY = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  return (
    <LinearGradient
      colors={gradient as [string, string, ...string[]]}
      style={styles.gradient}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
    >
      <Animated.View
        style={[
          styles.orb,
          {
            transform: [{ translateY }],
            opacity: night ? 0.15 : 0.25,
          },
        ]}
      />
      <WeatherParticles weatherCode={weatherCode} />
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  orb: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
});
