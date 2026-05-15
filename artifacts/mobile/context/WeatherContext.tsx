import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { City, VIETNAM_CITIES } from "@/constants/cities";

interface WeatherContextValue {
  selectedCity: City;
  setSelectedCity: (city: City) => void;
  savedCities: City[];
  addCity: (city: City) => void;
  removeCity: (city: City) => void;
  isCitySaved: (city: City) => boolean;
  isUsingLocation: boolean;
  locationCity: City | null;
  setLocationData: (city: City | null) => void;
  setIsUsingLocation: (v: boolean) => void;
}

const WeatherContext = createContext<WeatherContextValue | null>(null);

const STORAGE_KEY = "@weather_saved_cities";
const STORAGE_SELECTED_KEY = "@weather_selected_city";

export function WeatherProvider({ children }: { children: React.ReactNode }) {
  const [selectedCity, setSelectedCityState] = useState<City>(
    VIETNAM_CITIES[0]
  );
  const [savedCities, setSavedCities] = useState<City[]>([]);
  const [isUsingLocation, setIsUsingLocation] = useState(false);
  const [locationCity, setLocationCity] = useState<City | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [savedRaw, selectedRaw] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(STORAGE_SELECTED_KEY),
        ]);
        if (savedRaw) setSavedCities(JSON.parse(savedRaw));
        if (selectedRaw) setSelectedCityState(JSON.parse(selectedRaw));
      } catch {
        // ignore
      }
    })();
  }, []);

  const setSelectedCity = useCallback(async (city: City) => {
    setSelectedCityState(city);
    setIsUsingLocation(false);
    try {
      await AsyncStorage.setItem(STORAGE_SELECTED_KEY, JSON.stringify(city));
    } catch {
      // ignore
    }
  }, []);

  const addCity = useCallback(
    async (city: City) => {
      const exists = savedCities.some(
        (c) => c.latitude === city.latitude && c.longitude === city.longitude
      );
      if (exists) return;
      const next = [...savedCities, city];
      setSavedCities(next);
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
    },
    [savedCities]
  );

  const removeCity = useCallback(
    async (city: City) => {
      const next = savedCities.filter(
        (c) => !(c.latitude === city.latitude && c.longitude === city.longitude)
      );
      setSavedCities(next);
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
    },
    [savedCities]
  );

  const isCitySaved = useCallback(
    (city: City) => {
      return savedCities.some(
        (c) => c.latitude === city.latitude && c.longitude === city.longitude
      );
    },
    [savedCities]
  );

  const setLocationData = useCallback((city: City | null) => {
    setLocationCity(city);
    if (city) {
      setSelectedCityState(city);
      setIsUsingLocation(true);
    }
  }, []);

  return (
    <WeatherContext.Provider
      value={{
        selectedCity,
        setSelectedCity,
        savedCities,
        addCity,
        removeCity,
        isCitySaved,
        isUsingLocation,
        locationCity,
        setLocationData,
        setIsUsingLocation,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeatherContext() {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error("useWeatherContext must be used within WeatherProvider");
  return ctx;
}
