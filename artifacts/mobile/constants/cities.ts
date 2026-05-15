export interface City {
  name: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export const VIETNAM_CITIES: City[] = [
  {
    name: "Hà Nội",
    region: "Thủ đô",
    country: "Việt Nam",
    latitude: 21.0285,
    longitude: 105.8542,
    timezone: "Asia/Ho_Chi_Minh",
  },
  {
    name: "TP. Hồ Chí Minh",
    region: "Nam Bộ",
    country: "Việt Nam",
    latitude: 10.8231,
    longitude: 106.6297,
    timezone: "Asia/Ho_Chi_Minh",
  },
  {
    name: "Đà Nẵng",
    region: "Miền Trung",
    country: "Việt Nam",
    latitude: 16.0544,
    longitude: 108.2022,
    timezone: "Asia/Ho_Chi_Minh",
  },
  {
    name: "Hải Phòng",
    region: "Bắc Bộ",
    country: "Việt Nam",
    latitude: 20.8449,
    longitude: 106.6881,
    timezone: "Asia/Ho_Chi_Minh",
  },
  {
    name: "Cần Thơ",
    region: "Đồng bằng SCL",
    country: "Việt Nam",
    latitude: 10.0452,
    longitude: 105.7469,
    timezone: "Asia/Ho_Chi_Minh",
  },
  {
    name: "Huế",
    region: "Miền Trung",
    country: "Việt Nam",
    latitude: 16.4637,
    longitude: 107.5909,
    timezone: "Asia/Ho_Chi_Minh",
  },
  {
    name: "Nha Trang",
    region: "Nam Trung Bộ",
    country: "Việt Nam",
    latitude: 12.2388,
    longitude: 109.1967,
    timezone: "Asia/Ho_Chi_Minh",
  },
  {
    name: "Đà Lạt",
    region: "Tây Nguyên",
    country: "Việt Nam",
    latitude: 11.9404,
    longitude: 108.4583,
    timezone: "Asia/Ho_Chi_Minh",
  },
  {
    name: "Vũng Tàu",
    region: "Đông Nam Bộ",
    country: "Việt Nam",
    latitude: 10.346,
    longitude: 107.0843,
    timezone: "Asia/Ho_Chi_Minh",
  },
  {
    name: "Hội An",
    region: "Miền Trung",
    country: "Việt Nam",
    latitude: 15.8794,
    longitude: 108.335,
    timezone: "Asia/Ho_Chi_Minh",
  },
  {
    name: "Quy Nhơn",
    region: "Nam Trung Bộ",
    country: "Việt Nam",
    latitude: 13.7765,
    longitude: 109.2237,
    timezone: "Asia/Ho_Chi_Minh",
  },
  {
    name: "Buôn Ma Thuột",
    region: "Tây Nguyên",
    country: "Việt Nam",
    latitude: 12.6676,
    longitude: 108.0377,
    timezone: "Asia/Ho_Chi_Minh",
  },
  {
    name: "Vinh",
    region: "Bắc Trung Bộ",
    country: "Việt Nam",
    latitude: 18.6796,
    longitude: 105.6813,
    timezone: "Asia/Ho_Chi_Minh",
  },
  {
    name: "Thái Nguyên",
    region: "Đông Bắc Bộ",
    country: "Việt Nam",
    latitude: 21.5942,
    longitude: 105.8482,
    timezone: "Asia/Ho_Chi_Minh",
  },
  {
    name: "Phan Thiết",
    region: "Nam Trung Bộ",
    country: "Việt Nam",
    latitude: 10.9804,
    longitude: 108.2625,
    timezone: "Asia/Ho_Chi_Minh",
  },
  {
    name: "Rạch Giá",
    region: "Đồng bằng SCL",
    country: "Việt Nam",
    latitude: 10.0122,
    longitude: 105.0802,
    timezone: "Asia/Ho_Chi_Minh",
  },
  {
    name: "Pleiku",
    region: "Tây Nguyên",
    country: "Việt Nam",
    latitude: 13.9833,
    longitude: 108.0,
    timezone: "Asia/Ho_Chi_Minh",
  },
  {
    name: "Long Xuyên",
    region: "Đồng bằng SCL",
    country: "Việt Nam",
    latitude: 10.3864,
    longitude: 105.4352,
    timezone: "Asia/Ho_Chi_Minh",
  },
  {
    name: "Thanh Hóa",
    region: "Bắc Trung Bộ",
    country: "Việt Nam",
    latitude: 19.8079,
    longitude: 105.7757,
    timezone: "Asia/Ho_Chi_Minh",
  },
  {
    name: "Biên Hòa",
    region: "Đông Nam Bộ",
    country: "Việt Nam",
    latitude: 10.9574,
    longitude: 106.8426,
    timezone: "Asia/Ho_Chi_Minh",
  },
];

export function searchCities(query: string): City[] {
  if (!query.trim()) return VIETNAM_CITIES;
  const q = query
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return VIETNAM_CITIES.filter((city) => {
    const name = city.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const region = city.region
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return name.includes(q) || region.includes(q);
  });
}
