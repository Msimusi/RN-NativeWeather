import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Fontisto } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const API_KEY = "23a3e2b0c9e7ab43e4608fb7a1575be2";
const icons = {
  Clouds: "cloudy",
  Clear: "day-sunny",
  Atmosphere: "cloudy-gusts",
  Snow: "snow",
  Rain: "rains",
  Drizzle: "rain",
  Thunderstorm: "lightning",
};

export default function App() {
  const [city, setCity] = useState("Loading...");
  const [noons, setNoons] = useState([]);
  const [mornings, setMornings] = useState([]);
  const [nights, setNights] = useState([]);
  const [ok, setOk] = useState(true);

  const getWeather = async () => {
    const granted = await Location.requestForegroundPermissionsAsync();
    if (!granted) {
      setOk(false);
    }
    const {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({ accuracy: 5 });

    const location = await Location.reverseGeocodeAsync(
      { latitude, longitude },
      { useGoogleMaps: false }
    );
    setCity(`${location[0].city} ${location[0].district}`);

    // 날씨 값 받아오기
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
    );
    const json = await response.json();

    const mornings = await json.list.filter((weather) => {
      if (weather.dt_txt.includes("09:00:00")) {
        return weather;
      }
    });
    const noons = await json.list.filter((weather) => {
      if (weather.dt_txt.includes("12:00:00")) {
        return weather;
      }
    });
    const nights = await json.list.filter((weather) => {
      if (weather.dt_txt.includes("00:00:00")) {
        return weather;
      }
    });

    setMornings(mornings);
    setNoons(noons);
    setNights(nights);
  };

  useEffect(() => {
    getWeather();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.city}>
        <Text style={styles.cityName}>{city}</Text>
      </View>
      <ScrollView
        pagingEnabled
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weather}
      >
        {noons.length === 0 ? (
          <View style={{ ...styles.day, alignItems: "center" }}>
            <ActivityIndicator
              color="black"
              style={{ marginTop: 30 }}
              size="large"
            />
          </View>
        ) : (
          noons.map((noon, index) => (
            <View key={index} style={styles.day}>
              <View style={styles.top}>
                <Text style={styles.date}>
                  {parseInt(noon.dt_txt.split("-")[1])}월{""}
                  {parseInt(noon.dt_txt.split("-")[2].substr(0, 2))}일
                </Text>
                <Text style={styles.time}>
                  {noon.dt_txt.split("-")[2].substr(3, 5)} pm
                </Text>
                <Text style={styles.temp}>
                  {parseFloat(noon.main.temp).toFixed(1)}°
                </Text>
                <Text style={styles.desc}>
                  {noon.weather[0].main}
                  {"  "}
                  <Fontisto name={icons[noon.weather[0].main]} size={50} />
                </Text>
                <Text style={styles.tinyText}>
                  {noon.weather[0].description}
                </Text>
              </View>
              <View style={styles.bottom}>
                <View style={styles.bottomPiece}>
                  <Text style={styles.bottomTime}>9 am</Text>
                  <Text style={styles.bottomTemp}>
                    {parseFloat(mornings[index].main.temp).toFixed(1)}°
                  </Text>
                  <Fontisto
                    name={icons[mornings[index].weather[0].main]}
                    size={32}
                  />
                  <Text style={styles.bottomDesc}>
                    {mornings[index].weather[0].main}
                  </Text>
                </View>
                <View style={styles.bottomPiece}>
                  <Text style={styles.bottomTime}>12 am</Text>
                  <Text style={styles.bottomTemp}>
                    {parseFloat(nights[index].main.temp).toFixed(1)}°
                  </Text>
                  <Fontisto
                    name={icons[nights[index].weather[0].main]}
                    size={32}
                  />
                  <Text style={styles.bottomDesc}>
                    {nights[index].weather[0].main}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "orange",
  },
  city: {
    paddingTop: 20,
    height: "20%",
    justifyContent: "center",
    alignItems: "center",
  },
  cityName: { fontSize: 48, fontWeight: 800 },
  weather: {
    backgroundColor: "yellow",
  },
  top: {
    flex: 1.4,
    width: "85%",
    backgroundColor: "#FFDF08",
    marginTop: 50,
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  day: {
    width: SCREEN_WIDTH,
    alignItems: "center",
  },
  date: {
    textAlign: "center",
    fontSize: 32,
    fontWeight: 600,
  },
  time: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: 600,
  },
  temp: {
    fontSize: 118,
  },
  desc: {
    marginTop: -10,
    fontSize: 58,
    textAlign: "center",
  },
  tinyText: {
    fontSize: 30,
  },
  bottom: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  bottomPiece: {
    width: "32%",
    alignItems: "center",
    backgroundColor: "#FFDF00",
    padding: 8,
    borderRadius: 5,
  },
  bottomTime: {
    fontSize: 24,
    fontWeight: 600,
  },
  bottomTemp: {
    fontWeight: 600,
    fontSize: 40,
    marginVertical: 15,
    marginTop: 10,
  },
  bottomDesc: {
    fontSize: 24,
  },
});
