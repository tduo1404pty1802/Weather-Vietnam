import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  View,
} from "react-native";
import { isNightTime } from "@/constants/weatherCodes";

const { width: SW } = Dimensions.get("window");
export const SCENE_HEIGHT = 200;

// --- Sun ---
function SunScene() {
  const pulse = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const haloScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });
  const haloOpacity = pulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 0.55, 0.3] });

  const RAYS = 8;
  return (
    <View style={styles.sceneContainer}>
      {/* Glow */}
      <Animated.View
        style={[styles.sunGlow, { transform: [{ scale: haloScale }], opacity: haloOpacity }]}
      />
      {/* Rays */}
      <Animated.View style={[styles.raysContainer, { transform: [{ rotate: spin }] }]}>
        {Array.from({ length: RAYS }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.ray,
              {
                transform: [
                  { rotate: `${(i * 360) / RAYS}deg` },
                  { translateY: -52 },
                ],
              },
            ]}
          />
        ))}
      </Animated.View>
      {/* Sun core */}
      <View style={styles.sunCore} />
      {/* Drifting cloud */}
      <DriftCloud top={30} size={0.6} duration={14000} startX={-80} />
      <DriftCloud top={70} size={0.4} duration={20000} startX={-120} delay={6000} />
    </View>
  );
}

// --- Cloud ---
function DriftCloud({
  top,
  size = 1,
  duration = 12000,
  startX = -100,
  delay = 0,
}: {
  top: number;
  size?: number;
  duration?: number;
  startX?: number;
  delay?: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);
  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [startX, SW + 100],
  });
  const w = 80 * size;
  const h = 36 * size;
  return (
    <Animated.View
      style={{
        position: "absolute",
        top,
        transform: [{ translateX }],
        opacity: 0.5,
      }}
    >
      <View
        style={{
          width: w,
          height: h,
          borderRadius: h / 2,
          backgroundColor: "rgba(255,255,255,0.85)",
        }}
      />
      <View
        style={{
          position: "absolute",
          width: w * 0.55,
          height: h * 0.9,
          borderRadius: h * 0.45,
          backgroundColor: "rgba(255,255,255,0.85)",
          top: -h * 0.3,
          left: w * 0.2,
        }}
      />
    </Animated.View>
  );
}

// --- Cloudy scene ---
function CloudyScene({ heavy = false }) {
  return (
    <View style={styles.sceneContainer}>
      <DriftCloud top={10} size={1.4} duration={22000} startX={-60} />
      <DriftCloud top={55} size={1.1} duration={17000} startX={-140} delay={3000} />
      <DriftCloud top={25} size={0.8} duration={28000} startX={SW * 0.3} delay={8000} />
      {heavy && <DriftCloud top={80} size={1.2} duration={15000} startX={-80} delay={1000} />}
    </View>
  );
}

// --- Rain ---
interface RainDrop {
  x: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
}

function RainDrop({ x, delay, duration, size, opacity }: RainDrop) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-20, SCENE_HEIGHT + 20] });
  const opacityAnim = anim.interpolate({
    inputRange: [0, 0.1, 0.9, 1],
    outputRange: [0, opacity, opacity, 0],
  });
  return (
    <Animated.View
      style={{
        position: "absolute",
        left: x,
        width: size,
        height: size * 5,
        borderRadius: size / 2,
        backgroundColor: "rgba(180,220,255,0.7)",
        transform: [{ translateY }, { rotate: "12deg" }],
        opacity: opacityAnim,
      }}
    />
  );
}

function RainScene({ heavy = false }) {
  const count = heavy ? 28 : 18;
  const drops: RainDrop[] = Array.from({ length: count }, () => ({
    x: Math.random() * SW,
    delay: Math.random() * 1500,
    duration: heavy ? 600 + Math.random() * 300 : 900 + Math.random() * 400,
    size: 1.5 + Math.random() * 1.5,
    opacity: 0.5 + Math.random() * 0.4,
  }));

  return (
    <View style={styles.sceneContainer}>
      <DriftCloud top={0} size={1.6} duration={30000} startX={0} />
      <DriftCloud top={20} size={1.2} duration={24000} startX={SW * 0.4} />
      {drops.map((d, i) => (
        <RainDrop key={i} {...d} />
      ))}
    </View>
  );
}

// --- Lightning ---
function LightningBolt() {
  const flash = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(3000 + Math.random() * 2000),
        Animated.timing(flash, { toValue: 1, duration: 60, useNativeDriver: true }),
        Animated.timing(flash, { toValue: 0, duration: 80, useNativeDriver: true }),
        Animated.delay(100),
        Animated.timing(flash, { toValue: 0.8, duration: 50, useNativeDriver: true }),
        Animated.timing(flash, { toValue: 0, duration: 150, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const left = 30 + Math.random() * (SW - 80);

  return (
    <>
      <Animated.View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: "rgba(200,180,255,0.5)",
          opacity: flash,
        }}
        pointerEvents="none"
      />
      <Animated.View
        style={{
          position: "absolute",
          top: 20,
          left,
          opacity: flash,
        }}
      >
        <View style={styles.boltTop} />
        <View style={styles.boltMid} />
        <View style={styles.boltBottom} />
      </Animated.View>
    </>
  );
}

function StormScene() {
  return (
    <View style={styles.sceneContainer}>
      <DriftCloud top={0} size={1.8} duration={40000} startX={-20} />
      <DriftCloud top={30} size={1.4} duration={30000} startX={SW * 0.5} />
      <RainScene heavy />
      <LightningBolt />
    </View>
  );
}

// --- Night ---
function StarDot({ x, y, delay }: { x: number; y: number; delay: number }) {
  const twinkle = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(twinkle, { toValue: 0.2, duration: 1200, useNativeDriver: true }),
        Animated.timing(twinkle, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 2.5,
        height: 2.5,
        borderRadius: 1.25,
        backgroundColor: "#FFFFFF",
        opacity: twinkle,
      }}
    />
  );
}

function NightScene() {
  const stars = Array.from({ length: 30 }, () => ({
    x: Math.random() * SW,
    y: 5 + Math.random() * (SCENE_HEIGHT * 0.7),
    delay: Math.random() * 3000,
  }));
  return (
    <View style={styles.sceneContainer}>
      {stars.map((s, i) => (
        <StarDot key={i} {...s} />
      ))}
      {/* Crescent moon */}
      <View style={styles.moonOuter}>
        <View style={styles.moonInner} />
      </View>
    </View>
  );
}

// --- Fog ---
function FogWisp({ top, delay, duration }: { top: number; delay: number; duration: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(anim, { toValue: 1, duration, delay, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);
  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SW, SW],
  });
  return (
    <Animated.View
      style={{
        position: "absolute",
        top,
        left: 0,
        width: SW * 1.5,
        height: 20,
        borderRadius: 10,
        backgroundColor: "rgba(200,220,240,0.18)",
        transform: [{ translateX }],
      }}
    />
  );
}

function FogScene() {
  return (
    <View style={styles.sceneContainer}>
      <FogWisp top={30} delay={0} duration={8000} />
      <FogWisp top={70} delay={2500} duration={11000} />
      <FogWisp top={110} delay={1000} duration={9000} />
      <FogWisp top={150} delay={3500} duration={12000} />
    </View>
  );
}

// --- Main export ---
const RAIN_CODES = [51, 53, 55, 61, 63, 65, 80, 81, 82];
const HEAVY_RAIN_CODES = [63, 65, 81, 82];
const STORM_CODES = [95, 96, 99];
const SNOW_CODES = [71, 73, 75, 85, 86];
const CLOUDY_CODES = [2, 3];
const HEAVY_CLOUD_CODES = [3];
const FOG_CODES = [45, 48];

interface WeatherSceneProps {
  weatherCode: number;
  sunrise?: string;
  sunset?: string;
}

export default function WeatherScene({ weatherCode, sunrise, sunset }: WeatherSceneProps) {
  const hour = new Date().getHours();
  const night = isNightTime(hour, sunrise, sunset);

  if (night && !STORM_CODES.includes(weatherCode) && !RAIN_CODES.includes(weatherCode)) {
    return <NightScene />;
  }
  if (STORM_CODES.includes(weatherCode)) return <StormScene />;
  if (RAIN_CODES.includes(weatherCode))
    return <RainScene heavy={HEAVY_RAIN_CODES.includes(weatherCode)} />;
  if (FOG_CODES.includes(weatherCode)) return <FogScene />;
  if (CLOUDY_CODES.includes(weatherCode))
    return <CloudyScene heavy={HEAVY_CLOUD_CODES.includes(weatherCode)} />;
  return <SunScene />;
}

const styles = StyleSheet.create({
  sceneContainer: {
    width: SW,
    height: SCENE_HEIGHT,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  sunGlow: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255,220,80,0.25)",
  },
  raysContainer: {
    position: "absolute",
    width: 130,
    height: 130,
    alignItems: "center",
    justifyContent: "center",
  },
  ray: {
    position: "absolute",
    width: 4,
    height: 22,
    borderRadius: 2,
    backgroundColor: "rgba(255,220,50,0.75)",
  },
  sunCore: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#FFD740",
    shadowColor: "#FFB300",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 20,
    elevation: 10,
  },
  boltTop: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 5,
    borderBottomWidth: 30,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "rgba(255,255,180,0.9)",
    marginLeft: 8,
  },
  boltMid: {
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 5,
    borderTopWidth: 20,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "rgba(255,255,180,0.9)",
  },
  boltBottom: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 12,
    borderTopWidth: 22,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "rgba(255,255,180,0.9)",
    marginTop: -2,
    marginLeft: 4,
  },
  moonOuter: {
    position: "absolute",
    top: 30,
    right: 50,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F5F0C8",
  },
  moonInner: {
    position: "absolute",
    top: -6,
    left: 14,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(30,40,80,0.85)",
  },
});
