// storage.js
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export const getItem = async (key) => {
  try {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  } catch (e) {
    console.log("Storage getItem error:", e);
    return null;
  }
};

export const setItem = async (key, value) => {
  try {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  } catch (e) {
    console.log("Storage setItem error:", e);
  }
};