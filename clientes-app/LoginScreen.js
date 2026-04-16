import { useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

export default function LoginScreen({ onLogin, dark }) {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = "http://192.168.1.111:8001/login";

  const login = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: usuario,
          password: password
        })
      });

      const data = await res.json();

      if (data.success) {
        onLogin(data.user);
      } else {
        setError("Usuario o contraseña incorrectos");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    }

    setLoading(false);
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: dark ? "#000" : "#fff" }
    ]}>

      <Text style={[
        styles.title,
        { color: dark ? "#fff" : "#000" }
      ]}>
        Iniciar sesión
      </Text>

      <TextInput
        placeholder="Usuario"
        placeholderTextColor={dark ? "#aaa" : "#666"}
        value={usuario}
        onChangeText={setUsuario}
        style={[
          styles.input,
          {
            backgroundColor: dark ? "#111" : "#fff",
            color: dark ? "#fff" : "#000",
            borderColor: dark ? "#333" : "#ccc"
          }
        ]}
      />

      <TextInput
        placeholder="Contraseña"
        placeholderTextColor={dark ? "#aaa" : "#666"}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={[
          styles.input,
          {
            backgroundColor: dark ? "#111" : "#fff",
            color: dark ? "#fff" : "#000",
            borderColor: dark ? "#333" : "#ccc"
          }
        ]}
      />

      {error !== "" && (
        <Text style={styles.error}>{error}</Text>
      )}

      <TouchableOpacity
        onPress={login}
        style={styles.button}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            Entrar
          </Text>
        )}
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20
  },

  title: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold"
  },

  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16
  },

  button: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 8,
    marginTop: 10
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold"
  },

  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center"
  }
});