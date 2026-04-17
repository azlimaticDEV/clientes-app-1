let memory = {};

export const getItem = async (key) => {
  try {
    const AsyncStorage = require("@react-native-async-storage/async-storage").default;
    return await AsyncStorage.getItem(key);
  } catch {
    return memory[key] || null;
  }
};

export const setItem = async (key, value) => {
  try {
    const AsyncStorage = require("@react-native-async-storage/async-storage").default;
    await AsyncStorage.setItem(key, value);
  } catch {
    memory[key] = value;
  }
};

export const removeItem = async (key) => {
  try {
    const AsyncStorage = require("@react-native-async-storage/async-storage").default;
    await AsyncStorage.removeItem(key);
  } catch {
    delete memory[key];
  }
};