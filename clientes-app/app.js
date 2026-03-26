import axios from "axios";
import { useEffect, useState } from "react";
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";

export default function App() {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const API_URL = "http://192.168.1.111:8001/clientes"; // 👈 cambia IP

  // 🔄 cargar datos
  const cargarClientes = async () => {
    try {
      const res = await axios.get(API_URL);
      setClientes(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // 🔁 auto refresh cada 5s
  useEffect(() => {
    cargarClientes();

    const interval = setInterval(() => {
      cargarClientes();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // 🔍 filtro buscador
  const filtrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.numero.includes(busqueda) ||
    c.correo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <View style={styles.container}>
      
      {/* 🔍 BUSCADOR */}
      <TextInput
        style={styles.input}
        placeholder="Buscar..."
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
          <View style={styles.card}>
            <Text style={styles.nombre}>{item.nombre}</Text>
            <Text>{item.numero}</Text>
            <Text>{item.correo}</Text>
            <Text style={styles.tipo}>{item.tipo}</Text>
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
    marginTop: 40
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 8
  },
  card: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#eee",
    borderRadius: 10
  },
  nombre: {
    fontSize: 18,
    fontWeight: "bold"
  },
  tipo: {
    marginTop: 5,
    fontStyle: "italic",
    color: "gray"
  }
});