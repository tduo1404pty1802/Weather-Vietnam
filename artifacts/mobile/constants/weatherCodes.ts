export interface WeatherInfo {
  label: string;
  description: string;
  icon: string;
  isNight?: boolean;
  gradients: {
    day: string[];
    night: string[];
  };
}

export const WEATHER_CODES: Record<number, WeatherInfo> = {
  0: {
    label: "Trời quang",
    description: "Bầu trời trong xanh",
    icon: "sun",
    gradients: {
      day: ["#1565C0", "#1976D2", "#42A5F5", "#81D4FA"],
      night: ["#0D1B2A", "#1B2B4B", "#1E3A6E"],
    },
  },
  1: {
    label: "Ít mây",
    description: "Chủ yếu trời quang",
    icon: "cloud",
    gradients: {
      day: ["#1565C0", "#1976D2", "#4FC3F7"],
      night: ["#0D1B2A", "#1B2B4B", "#263D6B"],
    },
  },
  2: {
    label: "Có mây",
    description: "Trời có mây",
    icon: "cloud",
    gradients: {
      day: ["#37474F", "#455A64", "#607D8B"],
      night: ["#1A1A2E", "#16213E", "#0F3460"],
    },
  },
  3: {
    label: "Nhiều mây",
    description: "Trời nhiều mây",
    icon: "cloud",
    gradients: {
      day: ["#263238", "#37474F", "#546E7A"],
      night: ["#121212", "#1E1E2E", "#2D2D44"],
    },
  },
  45: {
    label: "Sương mù",
    description: "Sương mù dày đặc",
    icon: "wind",
    gradients: {
      day: ["#546E7A", "#78909C", "#90A4AE"],
      night: ["#1A1A2E", "#263238", "#37474F"],
    },
  },
  48: {
    label: "Sương muối",
    description: "Sương mù đóng băng",
    icon: "wind",
    gradients: {
      day: ["#455A64", "#607D8B", "#78909C"],
      night: ["#1A1A2E", "#263238", "#37474F"],
    },
  },
  51: {
    label: "Mưa phùn nhẹ",
    description: "Mưa phùn lác đác",
    icon: "cloud-drizzle",
    gradients: {
      day: ["#1A237E", "#283593", "#3949AB"],
      night: ["#0D1B2A", "#1B2B4B", "#1E3A6E"],
    },
  },
  53: {
    label: "Mưa phùn",
    description: "Mưa phùn vừa",
    icon: "cloud-drizzle",
    gradients: {
      day: ["#1A237E", "#283593", "#3F51B5"],
      night: ["#0D1B2A", "#1B2B4B", "#1E3A6E"],
    },
  },
  55: {
    label: "Mưa phùn nặng",
    description: "Mưa phùn dày đặc",
    icon: "cloud-drizzle",
    gradients: {
      day: ["#0D1B5E", "#1A237E", "#283593"],
      night: ["#060D1F", "#0D1B3E", "#1A2B5E"],
    },
  },
  61: {
    label: "Mưa nhẹ",
    description: "Mưa lác đác",
    icon: "cloud-rain",
    gradients: {
      day: ["#1565C0", "#1976D2", "#2196F3"],
      night: ["#0D1B2A", "#162035", "#1E2B47"],
    },
  },
  63: {
    label: "Mưa vừa",
    description: "Trời mưa vừa",
    icon: "cloud-rain",
    gradients: {
      day: ["#0D47A1", "#1565C0", "#1976D2"],
      night: ["#060D1F", "#0D1B3E", "#162035"],
    },
  },
  65: {
    label: "Mưa to",
    description: "Mưa lớn",
    icon: "cloud-rain",
    gradients: {
      day: ["#083280", "#0D47A1", "#1565C0"],
      night: ["#040A19", "#08152E", "#0D1B3E"],
    },
  },
  71: {
    label: "Tuyết nhẹ",
    description: "Tuyết rơi lác đác",
    icon: "cloud-snow",
    gradients: {
      day: ["#546E7A", "#607D8B", "#90A4AE"],
      night: ["#1A1A2E", "#263238", "#37474F"],
    },
  },
  73: {
    label: "Tuyết vừa",
    description: "Trời có tuyết",
    icon: "cloud-snow",
    gradients: {
      day: ["#455A64", "#546E7A", "#78909C"],
      night: ["#121212", "#1E1E2E", "#263238"],
    },
  },
  75: {
    label: "Tuyết nhiều",
    description: "Tuyết rơi nhiều",
    icon: "cloud-snow",
    gradients: {
      day: ["#37474F", "#455A64", "#607D8B"],
      night: ["#0D0D1A", "#1A1A2E", "#263238"],
    },
  },
  80: {
    label: "Mưa rào nhẹ",
    description: "Mưa rào lác đác",
    icon: "cloud-rain",
    gradients: {
      day: ["#1565C0", "#1976D2", "#2196F3"],
      night: ["#0D1B2A", "#162035", "#1E2B47"],
    },
  },
  81: {
    label: "Mưa rào",
    description: "Mưa rào vừa",
    icon: "cloud-rain",
    gradients: {
      day: ["#0D47A1", "#1565C0", "#1976D2"],
      night: ["#060D1F", "#0D1B3E", "#162035"],
    },
  },
  82: {
    label: "Mưa rào to",
    description: "Mưa rào lớn",
    icon: "cloud-rain",
    gradients: {
      day: ["#083280", "#0D47A1", "#1565C0"],
      night: ["#040A19", "#08152E", "#0D1B3E"],
    },
  },
  85: {
    label: "Tuyết rào nhẹ",
    description: "Mưa tuyết lác đác",
    icon: "cloud-snow",
    gradients: {
      day: ["#455A64", "#546E7A", "#78909C"],
      night: ["#121212", "#1E1E2E", "#263238"],
    },
  },
  86: {
    label: "Tuyết rào to",
    description: "Mưa tuyết lớn",
    icon: "cloud-snow",
    gradients: {
      day: ["#37474F", "#455A64", "#607D8B"],
      night: ["#0D0D1A", "#1A1A2E", "#263238"],
    },
  },
  95: {
    label: "Giông bão",
    description: "Có sấm sét",
    icon: "cloud-lightning",
    gradients: {
      day: ["#1A1A2E", "#16213E", "#4A148C"],
      night: ["#0D0D1A", "#1A1A2E", "#2D1B4E"],
    },
  },
  96: {
    label: "Giông và mưa đá nhỏ",
    description: "Giông kèm mưa đá",
    icon: "cloud-lightning",
    gradients: {
      day: ["#12122A", "#1A1A3E", "#380E6B"],
      night: ["#080815", "#12122A", "#1E0E3E"],
    },
  },
  99: {
    label: "Giông và mưa đá lớn",
    description: "Giông bão mạnh",
    icon: "cloud-lightning",
    gradients: {
      day: ["#0D0D1F", "#12122A", "#2D0B55"],
      night: ["#060610", "#0D0D1F", "#180840"],
    },
  },
};

export function getWeatherInfo(code: number): WeatherInfo {
  return (
    WEATHER_CODES[code] ?? {
      label: "Không rõ",
      description: "Không có dữ liệu",
      icon: "cloud",
      gradients: {
        day: ["#1565C0", "#1976D2", "#42A5F5"],
        night: ["#0D1B2A", "#1B2B4B", "#1E3A6E"],
      },
    }
  );
}

export function isNightTime(hour: number, sunrise?: string, sunset?: string): boolean {
  if (sunrise && sunset) {
    const now = Date.now();
    const sr = new Date(sunrise).getTime();
    const ss = new Date(sunset).getTime();
    if (!isNaN(sr) && !isNaN(ss)) {
      return now < sr || now > ss;
    }
  }
  return hour < 6 || hour >= 19;
}

export function getWindDirection(degrees: number): string {
  const dirs = ["B", "ĐB", "Đ", "ĐN", "N", "TN", "T", "TB"];
  const ix = Math.round(degrees / 45) % 8;
  return dirs[ix];
}

export function getUvLevel(uv: number): { label: string; color: string } {
  if (uv < 3) return { label: "Thấp", color: "#4CAF50" };
  if (uv < 6) return { label: "Vừa", color: "#FFC107" };
  if (uv < 8) return { label: "Cao", color: "#FF9800" };
  if (uv < 11) return { label: "Rất cao", color: "#F44336" };
  return { label: "Cực cao", color: "#9C27B0" };
}

export function getAqiLevel(aqi: number): { label: string; color: string } {
  if (aqi <= 50) return { label: "Tốt", color: "#4CAF50" };
  if (aqi <= 100) return { label: "Vừa", color: "#FFC107" };
  if (aqi <= 150) return { label: "Kém", color: "#FF9800" };
  if (aqi <= 200) return { label: "Xấu", color: "#F44336" };
  return { label: "Nguy hại", color: "#9C27B0" };
}
