import React, { useEffect, useState } from "react";
import {
  FlatList,
  Linking,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

export default function HomeScreen() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const scheme = useColorScheme();
  const dark = scheme === "dark";

  const API_URL = "http://192.168.1.111:8001/clientes";

  const cargarClientes = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setClientes(data);
    } catch (err) {
      console.log("ERROR:", err);
    }
  };

  useEffect(() => {
    cargarClientes();

    const interval = setInterval(() => {
      cargarClientes();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const filtrados = clientes.filter((c) =>
    c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.numero?.includes(busqueda) ||
    c.correo?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // 📞 llamar
  const llamar = (numero: string) => {
    Linking.openURL(`tel:${numero}`);
  };

  // 📧 email
const email = (correo: string) => {
  const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${correo}`;
  Linking.openURL(url);
};

  // 💬 WhatsApp
  const whatsapp = (numero: string) => {
    Linking.openURL(`https://wa.me/${numero}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: dark ? "#000" : "#fff" }]}>
      {/* 🔍 BUSCADOR */}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: dark ? "#111" : "#fff",
            color: dark ? "#fff" : "#000",
            borderColor: dark ? "#333" : "#ccc",
          },
        ]}
        placeholder="Buscar..."
        placeholderTextColor={dark ? "#aaa" : "#666"}
        value={busqueda}
        onChangeText={setBusqueda}
      />

      {/* 📋 LISTA */}
      <FlatList
        data={filtrados}
        keyExtractor={(item) => item.codigo}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={cargarClientes} />
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              { backgroundColor: dark ? "#111" : "#eee" },
            ]}
          >
            <Text style={[styles.nombre, { color: dark ? "#fff" : "#000" }]}>
              {item.nombre}
            </Text>

            <Text style={{ color: dark ? "#ccc" : "#333" }}>
              {item.numero}
            </Text>

            <Text style={{ color: dark ? "#ccc" : "#333" }}>
              {item.correo}
            </Text>

            <Text style={styles.tipo}>{item.tipo}</Text>

            {/* 🔥 BOTONES */}
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => llamar(item.numero)}>
                <Text style={styles.icon}>📞</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => email(item.correo)}>
                <Text style={styles.icon}>📧</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => whatsapp(item.numero)}>
                <Text style={styles.icon}>💬</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 40,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  card: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
  nombre: {
    fontSize: 18,
    fontWeight: "bold",
  },
  tipo: {
    marginTop: 5,
    fontStyle: "italic",
    color: "gray",
  },
  actions: {
    flexDirection: "row",
    marginTop: 10,
    gap: 20,
  },
  icon: {
    fontSize: 22,
  },
});