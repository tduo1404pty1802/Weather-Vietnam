import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

const { width: SW, height: SH } = Dimensions.get("window");

interface ParticleProps {
  x: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
  type: "rain" | "snow" | "bubble";
}

function Particle({ x, delay, duration, size, opacity, type }: ParticleProps) {
  const anim = useRef(new Animated.Value(0)).current;
  const swayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fall = Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      })
    );

    const sway = Animated.loop(
      Animated.sequence([
        Animated.timing(swayAnim, {
          toValue: 1,
          duration: duration * 0.7,
          useNativeDriver: true,
        }),
        Animated.timing(swayAnim, {
          toValue: 0,
          duration: duration * 0.7,
          useNativeDriver: true,
        }),
      ])
    );

    fall.start();
    sway.start();
    return () => {
      fall.stop();
      sway.stop();
    };
  }, []);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, SH + 20],
  });

  const translateX = swayAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, type === "rain" ? 5 : 20],
  });

  const particleOpacity = anim.interpolate({
    inputRange: [0, 0.1, 0.9, 1],
    outputRange: [0, opacity, opacity, 0],
  });

  if (type === "rain") {
    return (
      <Animated.View
        style={[
          styles.rain,
          {
            left: x,
            width: size * 0.4,
            height: size * 3,
            opacity: particleOpacity,
            transform: [{ translateY }, { translateX }],
          },
        ]}
      />
    );
  }

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          left: x,
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity: particleOpacity,
          transform: [{ translateY }, { translateX }],
        },
      ]}
    />
  );
}

interface Props {
  weatherCode: number;
}

const RAIN_CODES = [51, 53, 55, 61, 63, 65, 80, 81, 82];
const STORM_CODES = [95, 96, 99];
const SNOW_CODES = [71, 73, 75, 85, 86];

export default function WeatherParticles({ weatherCode }: Props) {
  const isRain = RAIN_CODES.includes(weatherCode) || STORM_CODES.includes(weatherCode);
  const isSnow = SNOW_CODES.includes(weatherCode);
  const isClear = weatherCode === 0 || weatherCode === 1;

  if (!isRain && !isSnow && !isClear) return null;

  const count = isRain ? 18 : isSnow ? 14 : 8;
  const type: "rain" | "snow" | "bubble" = isRain ? "rain" : isSnow ? "snow" : "bubble";

  const particles = Array.from({ length: count }, (_, i) => ({
    x: Math.random() * SW,
    delay: Math.random() * 2000,
    duration: isRain
      ? 1000 + Math.random() * 600
      : isSnow
      ? 3000 + Math.random() * 2000
      : 4000 + Math.random() * 3000,
    size: isRain ? 2 + Math.random() * 2 : 4 + Math.random() * 8,
    opacity: isRain ? 0.3 + Math.random() * 0.3 : 0.15 + Math.random() * 0.2,
    type,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => (
        <Particle key={i} {...p} type={type} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  rain: {
    position: "absolute",
    backgroundColor: "rgba(173,216,230,0.6)",
    borderRadius: 1,
  },
  bubble: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
});
