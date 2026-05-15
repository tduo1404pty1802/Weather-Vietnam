import { useQuery } from "@tanstack/react-query";
import { City } from "@/constants/cities";

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: number;
  precipitation: number;
  visibility: number;
  uvIndex: number;
  pressure: number;
  time: string;
}

export interface HourlyWeather {
  time: string;
  temperature: number;
  humidity: number;
  precipitationProbability: number;
  weatherCode: number;
  windSpeed: number;
}

export interface DailyWeather {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
  precipitationSum: number;
  precipitationProbabilityMax: number;
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyWeather[];
  daily: DailyWeather[];
  latitude: number;
  longitude: number;
  timezone: string;
  generationTime: number;
}

async function fetchWeather(city: City): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: city.latitude.toString(),
    longitude: city.longitude.toString(),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "precipitation",
      "weather_code",
      "surface_pressure",
      "wind_speed_10m",
      "wind_direction_10m",
      "uv_index",
      "visibility",
    ].join(","),
    hourly: [
      "temperature_2m",
      "relative_humidity_2m",
      "precipitation_probability",
      "weather_code",
      "wind_speed_10m",
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "sunrise",
      "sunset",
      "uv_index_max",
      "precipitation_sum",
      "precipitation_probability_max",
    ].join(","),
    timezone: city.timezone,
    forecast_days: "7",
    wind_speed_unit: "kmh",
  });

  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`
  );
  if (!res.ok) throw new Error("Không thể tải dữ liệu thời tiết");
  const data = await res.json();

  const currentIndex = data.current_units
    ? 0
    : data.hourly.time.findIndex(
        (t: string) =>
          new Date(t) >= new Date(data.current?.time ?? new Date())
      );

  const now = new Date();
  const hourOffset = now.getTimezoneOffset() / 60;
  const currentHourIndex = data.hourly.time.findIndex((t: string) => {
    const d = new Date(t);
    return d >= now;
  });
  const sliceStart = Math.max(0, currentHourIndex);
  const sliceEnd = sliceStart + 24;

  return {
    current: {
      temperature: Math.round(data.current.temperature_2m),
      feelsLike: Math.round(data.current.apparent_temperature),
      humidity: data.current.relative_humidity_2m,
      windSpeed: Math.round(data.current.wind_speed_10m),
      windDirection: data.current.wind_direction_10m,
      weatherCode: data.current.weather_code,
      precipitation: data.current.precipitation,
      visibility: Math.round(data.current.visibility / 1000),
      uvIndex: data.current.uv_index,
      pressure: Math.round(data.current.surface_pressure),
      time: data.current.time,
    },
    hourly: data.hourly.time
      .slice(sliceStart, sliceEnd)
      .map((t: string, i: number) => ({
        time: t,
        temperature: Math.round(data.hourly.temperature_2m[sliceStart + i]),
        humidity: data.hourly.relative_humidity_2m[sliceStart + i],
        precipitationProbability:
          data.hourly.precipitation_probability[sliceStart + i],
        weatherCode: data.hourly.weather_code[sliceStart + i],
        windSpeed: Math.round(data.hourly.wind_speed_10m[sliceStart + i]),
      })),
    daily: data.daily.time.map((d: string, i: number) => ({
      date: d,
      weatherCode: data.daily.weather_code[i],
      tempMax: Math.round(data.daily.temperature_2m_max[i]),
      tempMin: Math.round(data.daily.temperature_2m_min[i]),
      sunrise: data.daily.sunrise[i],
      sunset: data.daily.sunset[i],
      uvIndexMax: data.daily.uv_index_max[i],
      precipitationSum: data.daily.precipitation_sum[i],
      precipitationProbabilityMax:
        data.daily.precipitation_probability_max[i],
    })),
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone,
    generationTime: data.generationtime_ms,
  };
}

export function useWeather(city: City) {
  return useQuery({
    queryKey: ["weather", city.latitude, city.longitude],
    queryFn: () => fetchWeather(city),
    refetchInterval: 10 * 60 * 1000, // refresh every 10 minutes
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });
}
