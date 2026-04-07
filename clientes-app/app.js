import { useEffect, useState } from "react";
import {
  FlatList,
  Linking,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme
} from "react-native";

import * as Storage from "./storage";

export default function App() {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [favoritos, setFavoritos] = useState([]);
  const [filtro, setFiltro] = useState("todos");

  const dark = useColorScheme() === "dark";

  const API_URL = "http://192.168.1.111:8001/clientes";

  // 🔄 cargar clientes
  const cargarClientes = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setClientes(data);
    } catch (err) {
      console.log(err);
    }
  };

  // ⭐ cargar favoritos
  const cargarFavoritos = async () => {
    const favs = await Storage.getItem("favoritos");
    if (favs) setFavoritos(JSON.parse(favs));
  };

  // ⭐ toggle favorito
  const toggleFavorito = async (codigo) => {
    let nuevos;
    if (favoritos.includes(codigo)) {
      nuevos = favoritos.filter((f) => f !== codigo);
    } else {
      nuevos = [...favoritos, codigo];
    }
    setFavoritos(nuevos);
    await Storage.setItem("favoritos", JSON.stringify(nuevos));
  };

  useEffect(() => {
    cargarClientes();
    cargarFavoritos();

    const interval = setInterval(() => {
      cargarClientes();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // 🔍 filtro + búsqueda
  let filtrados = clientes.filter((c) => {
    if (!c) return false;

    const coincideBusqueda =
      (c.nombre || "").toLowerCase().includes(busqueda.toLowerCase()) ||
      (c.numero || "").includes(busqueda) ||
      (c.correo || "").toLowerCase().includes(busqueda.toLowerCase());

    if (!coincideBusqueda) return false;

    if (filtro === "favoritos") return favoritos.includes(c.codigo);
    if (filtro === "clientes") return c.tipo === "c";
    if (filtro === "otros") return c.tipo === "o";
    if (filtro === "spam") return c.tipo === "s";

    return true;
  });

  // ⭐ favoritos arriba
  filtrados.sort((a, b) => {
    const aFav = favoritos.includes(a.codigo);
    const bFav = favoritos.includes(b.codigo);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return 0;
  });

  // 📞 acciones
  const llamar = (numero) => Linking.openURL(`tel:${numero}`);
  const email = (correo) =>
    Linking.openURL(`https://mail.google.com/mail/?view=cm&fs=1&to=${correo}`);
  const whatsapp = (numero) =>
    Linking.openURL(`https://wa.me/${numero}`);

  return (
    <View style={[styles.container, { backgroundColor: dark ? "#000" : "#fff" }]}>

      {/* 🔍 BUSCADOR */}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: dark ? "#111" : "#fff",
            color: dark ? "#fff" : "#000",
            borderColor: dark ? "#333" : "#ccc"
          }
        ]}
        placeholder="Buscar..."
        placeholderTextColor={dark ? "#aaa" : "#666"}
        value={busqueda}
        onChangeText={setBusqueda}
      />

      {/* 🔥 FILTROS */}
      <View style={styles.filtros}>
        {["todos", "favoritos", "clientes", "otros", "spam"].map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filtroBtn,
              { backgroundColor: filtro === f ? "#007AFF" : "#ccc" }
            ]}
            onPress={() => setFiltro(f)}
          >
            <Text style={{
              color: filtro === f ? "#fff" : "#000",
              fontSize: 14
            }}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 📋 LISTA */}
      <FlatList
        data={filtrados}
        keyExtractor={(item) => item.codigo}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={cargarClientes} />
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: dark ? "#111" : "#eee" }]}>

            <Text style={[styles.nombre, { color: dark ? "#fff" : "#000" }]}>
              {item.nombre}
            </Text>

            <Text style={[styles.texto, { color: dark ? "#ccc" : "#333" }]}>
              {item.numero}
            </Text>

            <Text style={[styles.texto, { color: dark ? "#ccc" : "#333" }]}>
              {item.correo}
            </Text>

            {/* BOTONES */}
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
              <TouchableOpacity onPress={() => toggleFavorito(item.codigo)}>
                <Text style={[
                  styles.icon,
                  { color: favoritos.includes(item.codigo) ? "#FFD700" : dark ? "#fff" : "#000" }
                ]}>
                  {favoritos.includes(item.codigo) ? "⭐" : "☆"}
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 40 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 8, fontSize: 18 },
  filtros: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
  filtroBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, marginRight: 8, marginBottom: 5 },
  card: { padding: 15, marginBottom: 10, borderRadius: 10 },
  nombre: { fontSize: 22, fontWeight: "bold", marginBottom: 6 },
  texto: { fontSize: 16, marginBottom: 4 },
  actions: { flexDirection: "row", marginTop: 10, gap: 15 },
  icon: { fontSize: 22 }
});