const appJson = require("./app.json");

module.exports = () => {
  const androidGoogleMapsApiKey = process.env.EXPO_PUBLIC_ANDROID_GOOGLE_MAPS_API_KEY;
  const expo = {
    ...appJson.expo,
    android: {
      ...appJson.expo.android,
    },
  };

  if (androidGoogleMapsApiKey) {
    expo.android.config = {
      ...expo.android.config,
      googleMaps: {
        apiKey: androidGoogleMapsApiKey,
      },
    };
  }

  return { expo };
};
