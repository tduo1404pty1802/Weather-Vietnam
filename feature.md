

Sau khi khảo sát toàn bộ mã nguồn, đây là các ý tưởng nâng cấp theo mức độ ưu tiên:

---

## Lỗi / Tính năng bị bỏ sót (nên fix ngay)

**1. `WeatherParticles` đang là dead code**
Component được viết hoàn chỉnh (mưa, tuyết, bong bóng) nhưng chưa được render ở bất kỳ đâu. Chỉ cần mount vào `WeatherScene` hoặc màn hình chính.

**2. Night/Day detection sai logic**
Hiện dùng `hour < 6 || hour >= 19` cứng nhắc. Nhưng `sunrise/sunset` data đã có sẵn từ API → nên dùng để xác định đúng ban ngày/đêm (quan trọng vì Việt Nam có độ lệch mặt trời theo mùa).

**3. AQI đã có helper nhưng không hiển thị**
`getAqiLevel()` đã viết trong `weatherCodes.ts` nhưng không render ở đâu. Có thể thêm vào `WeatherDetails` hoặc `LifestyleCards`.

**4. Timezone cứng "Asia/Ho_Chi_Minh" cho tất cả thành phố**
Các thành phố biên giới như Lào Cai, Hà Tiên cần đúng timezone — dù hiện tại ít ảnh hưởng nhưng dễ fix bằng cách map đúng trong `cities.ts`.

---

## Nâng cấp UX có giá trị cao

**5. Weather Alerts / Cảnh báo thời tiết**
Open-Meteo hỗ trợ `weather_code` cực đoan (bão, sương mù dày, lốc). Thêm banner cảnh báo nổi bật khi `weatherCode >= 80` (mưa đá, bão mạnh).

**6. So sánh nhiệt độ hôm nay vs hôm qua**
Open-Meteo có API lịch sử (`/v1/archive`). Thêm dòng nhỏ "Hôm nay +2°C so với hôm qua" sẽ rất hữu ích cho người dùng.

**7. Bản đồ nhiệt / Radar mưa mini**
Open-Meteo cung cấp tile layer WMS. Tích hợp `react-native-maps` với overlay radar mưa cho màn hình chi tiết.

**8. Search screen: Batch fetching nhiệt độ**
Hiện tại mỗi city trong kết quả search gửi 1 API request riêng → N queries. Nên dùng `Promise.all` hoặc query batch.

**9. Màn hình chi tiết thành phố**
Hiện chỉ có 2 tabs (home + search). Có thể thêm tab hoặc bottom sheet cho từng thành phố đã lưu, hiển thị 7-day forecast nhanh khi swipe.

---

## Tính năng mới đáng xây

**10. Notifications / Nhắc nhở thời tiết**
Dùng `expo-notifications`: Gửi push notification buổi sáng "Hôm nay có mưa, nhớ mang ô!" hoặc cảnh báo UV cao trước khi ra ngoài.

**11. Widget (iOS/Android)**
`expo-widgets` (hoặc native module) để hiện nhiệt độ + icon ngay màn hình chính điện thoại — đây là tính năng người dùng app thời tiết mong chờ nhất.

**12. Chế độ offline**
React Query đã có `persistQueryClient` + `AsyncStorage`. Chỉ cần cấu hình persist cache → App vẫn hiện dữ liệu cũ khi mất mạng thay vì crash.

**13. Theme sáng / tối có thể chọn thủ công**
`useColors` hook đã được viết nhưng chỉ dùng ở `ErrorFallback`. Cần dùng xuyên suốt toàn app + thêm toggle trong Settings.

**14. Chia sẻ thời tiết**
Nút share snapshot màn hình hiện tại (dùng `expo-sharing` + `react-native-view-shot`) — "Sài Gòn đang 35°C ☀️" kiểu social share.

---

## Cải thiện kỹ thuật

**15. SVG Chart trên native**
`TempChart` dùng SVG thuần sẽ không hoạt động trên iOS/Android. Cần dùng `react-native-svg` wrapper hoặc thay bằng `victory-native`.

**16. Tên vị trí GPS thực**
Khi dùng geolocation, hiện hiển thị "Vị trí của bạn" cứng. Thêm reverse geocoding (`expo-location.reverseGeocodeAsync`) để hiện tên phường/quận thực.

---

**Ưu tiên đề xuất nếu bắt tay ngay:** Fix `WeatherParticles` → Night/day từ sunrise data → Offline cache → Weather alerts. Bốn cái này tốn ít công nhất nhưng cải thiện chất lượng app rõ rệt nhất.

