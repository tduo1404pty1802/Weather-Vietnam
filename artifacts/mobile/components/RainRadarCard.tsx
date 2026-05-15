import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

import { City } from "@/constants/cities";

interface Props {
  city: City;
}

interface RainViewerFrame {
  path: string;
  time: number;
}

interface RainViewerResponse {
  host: string;
  radar?: {
    past?: RainViewerFrame[];
    nowcast?: RainViewerFrame[];
  };
}

async function fetchRainViewer(): Promise<RainViewerResponse | null> {
  try {
    const res = await fetch("https://api.rainviewer.com/public/weather-maps.json");
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function formatFrameTime(timestamp?: number) {
  if (!timestamp) return "Đang cập nhật";
  const d = new Date(timestamp * 1000);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

function NativeRadarMap({ city, tileUrl }: { city: City; tileUrl: string }) {
  // Lazy require để web export không cố render native map.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Maps = require("react-native-maps");
  const MapView = Maps.default;
  const UrlTile = Maps.UrlTile;
  const Marker = Maps.Marker;

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: city.latitude,
        longitude: city.longitude,
        latitudeDelta: 4,
        longitudeDelta: 4,
      }}
      scrollEnabled={false}
      zoomEnabled={false}
      pitchEnabled={false}
      rotateEnabled={false}
      toolbarEnabled={false}
    >
      <UrlTile urlTemplate={tileUrl} maximumZ={8} flipY={false} zIndex={2} />
      <Marker coordinate={{ latitude: city.latitude, longitude: city.longitude }} title={city.name} />
    </MapView>
  );
}

export default function RainRadarCard({ city }: Props) {
  const { data } = useQuery({
    queryKey: ["rainviewer-radar"],
    queryFn: fetchRainViewer,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  const latestFrame = useMemo(() => {
    const frames = [...(data?.radar?.past ?? []), ...(data?.radar?.nowcast ?? [])];
    return frames.length > 0 ? frames[frames.length - 1] : null;
  }, [data]);

  const tileUrl = data?.host && latestFrame
    ? `${data.host}${latestFrame.path}/256/{z}/{x}/{y}/2/1_1.png`
    : null;

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.sectionTitle}>Radar mưa</Text>
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>{formatFrameTime(latestFrame?.time)}</Text>
        </View>
      </View>

      <View style={styles.card}>
        {Platform.OS === "web" ? (
          <View style={styles.fallback}>
            <Feather name="map" size={28} color="rgba(255,255,255,0.45)" />
            <Text style={styles.fallbackTitle}>Radar hỗ trợ tốt nhất trên mobile</Text>
            <Text style={styles.fallbackText}>Mở bằng Android emulator hoặc Expo Go để xem lớp mưa động.</Text>
          </View>
        ) : tileUrl ? (
          <>
            <NativeRadarMap city={city} tileUrl={tileUrl} />
            <View style={styles.overlay} pointerEvents="none">
              <Text style={styles.overlayTitle}>{city.name}</Text>
              <Text style={styles.overlaySub}>Lớp mưa RainViewer</Text>
            </View>
          </>
        ) : (
          <View style={styles.fallback}>
            <Feather name="cloud-rain" size={28} color="rgba(255,255,255,0.45)" />
            <Text style={styles.fallbackTitle}>Đang tải radar</Text>
            <Text style={styles.fallbackText}>Lớp mưa sẽ xuất hiện trong giây lát.</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4FC3F7",
  },
  liveText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.72)",
  },
  card: {
    height: 210,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.13)",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    position: "absolute",
    left: 12,
    bottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
    backgroundColor: "rgba(11,29,58,0.72)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  overlayTitle: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  overlaySub: {
    marginTop: 2,
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.58)",
  },
  fallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  fallbackTitle: {
    marginTop: 10,
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "rgba(255,255,255,0.82)",
  },
  fallbackText: {
    marginTop: 5,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 17,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.48)",
  },
});
