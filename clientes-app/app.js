import { useEffect, useState } from "react";
import {
  FlatList,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";

import * as Storage from "./storage";

/* ================= API ================= */
const API = "http://192.168.1.111:8001";

/* ================= TEMA MEJORADO ================= */
const THEME = (dark) => ({
  bg: dark ? "#0b0b10" : "#f4f6fb",
  card: dark ? "#161622" : "#ffffff",
  text: dark ? "#ffffff" : "#111111",
  sub: dark ? "#a9b0c7" : "#555",
  border: dark ? "#2a2a3a" : "#e6e8ef",
  accent: "#3b82f6"
});

/* ================= TIPOS ================= */
const TIPO = {
  c: "Clientes",
  o: "Otros",
  s: "Spam",
  e: "Exclientes",
  p: "Personal"
};

export default function App() {
  const dark = useColorScheme() === "dark";
  const t = THEME(dark);

  const [token, setToken] = useState(null);

  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");

  const [fav, setFav] = useState([]);

  const [editModal, setEditModal] = useState(false);

const [notas, setNotas] = useState({});
const [notaEdit, setNotaEdit] = useState("");
const [notaOpen, setNotaOpen] = useState(null);
const [editCodigo, setEditCodigo] = useState("");
const [editNombre, setEditNombre] = useState("");
const [editNumero, setEditNumero] = useState("");
const [editCorreo, setEditCorreo] = useState("");
const [editTipo, setEditTipo] = useState("c");
  const [modal, setModal] = useState(false);
  const [nums, setNums] = useState([]);
  const [accion, setAccion] = useState("");
  const [showCreate, setShowCreate] = useState(false);
const [newNombre, setNewNombre] = useState("");
const [newNumero, setNewNumero] = useState("");
const [newCorreo, setNewCorreo] = useState("");
const [newTipo, setNewTipo] = useState("clientes");
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyyDSyB1Y8XCXFxfgJ9HNvwCe8YymzR-u3KXO_WBvi1B_OhjeYuKgYiAgIRK2mfYuUn/exec";

  /* ================= INIT ================= */
useEffect(() => {
  init();
}, []);

// 🔥 ESTE CONTROLA TODO (clientes + favoritos)
useEffect(() => {
  if (!token) return;

  const cargarTodo = async () => {
    try {

      const notasRes = await fetch(API + "/notas", {
  headers: { token }
});

const notasData = await notasRes.json();
setNotas(notasData || {});

      // FAVORITOS
      const favRes = await fetch(API + "/favoritos", {
        headers: { token }
      });

      if (favRes.status === 401) {
        console.log("TOKEN INVALIDO (FAV)");
        logout();
        return;
      }

      const favData = await favRes.json();
      setFav(Array.isArray(favData) ? favData : []);

      // CLIENTES
      await loadClientes(token);

    } catch (e) {
      console.log("ERROR LOAD:", e);
    }
  };

  cargarTodo();

}, [token]);

// 🔁 REFRESH AUTOMATICO
useEffect(() => {
  if (!token) return;

  const interval = setInterval(() => {
    loadClientes(token);
  }, 3000);

  return () => clearInterval(interval);
}, [token]);

// 🔥 INIT LIMPIO (SIN FETCH)
const init = async () => {
  try {
    const tk = await Storage.getItem("token");

    console.log("TOKEN STORAGE:", tk);

    if (!tk) return;

    setToken(tk);

  } catch (e) {
    console.log("INIT ERROR:", e);
  }
};

  /* ================= LOGIN ================= */
const login = async () => {
  try {
    const res = await fetch(API + "/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, password: pass })
    });

    const data = await res.json();

    if (!data.token) return alert("Login incorrecto");

    await Storage.setItem("token", data.token);

    setToken(data.token);

    setUser("");
    setPass("");

    // 🔥 cargar TODO bien
    const [clientesRes, favRes] = await Promise.all([
      fetch(API + "/clientes", { headers: { token: data.token } }),
      fetch(API + "/favoritos", { headers: { token: data.token } })
    ]);

    const clientesData = await clientesRes.json();
    const favData = await favRes.json();

    setClientes(Array.isArray(clientesData) ? clientesData : []);
    setFav(Array.isArray(favData) ? favData : []);

  } catch (e) {
    console.log(e);
  }
};
  /* ================= LOGOUT FIX ================= */
const logout = async () => {
  try {
    await Storage.removeItem("token");
  } catch (e) {
    console.log(e);
  }

  // 🔥 RESET COMPLETO DE ESTADO
  setToken(null);

  setUser("");
  setPass("");
  setBusqueda("");

  setClientes([]);
  setFav([]);
};

  /* ================= CLIENTES ================= */
const loadClientes = async (tk) => {
  if (!tk) return; // 🔥 CLAVE

  try {
    const res = await fetch(API + "/clientes", {
      headers: { token: tk }
    });

    if (res.status === 401) {
      console.log("TOKEN INVALIDO");
      logout();
      return;
    }

    const data = await res.json();

    setClientes(Array.isArray(data) ? data : []);

  } catch (e) {
    console.log(e);
  }
};

  /* ================= FAVORITOS ================= */
const toggleFav = async (id) => {
  const n = fav.includes(id)
    ? fav.filter(x => x !== id)
    : [...fav, id];

  setFav(n);

  try {
    await fetch(API + "/favoritos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token
      },
      body: JSON.stringify({ favoritos: n })
    });

  } catch (e) {
    console.log("ERROR FAVORITOS:", e);
  }
};

  /* ================= ACCIONES ================= */
  const openAction = (value, type) => {
    const list = (value || "")
      .split(",")
      .map(x => x.trim())
      .filter(Boolean);

    if (list.length === 1) {
      run(list[0], type);
    } else {
      setNums(list);
      setAccion(type);
      setModal(true);
    }
  };

  const run = (n, type) => {
    if (type === "tel") Linking.openURL(`tel:${n}`);
    if (type === "wa") Linking.openURL(`https://wa.me/${n}`);
    if (type === "mail") Linking.openURL(`mailto:${n}`);
  };

  // 🔥 AÑADE ESTO JUSTO DEBAJO DE openAction / run (no borra nada)
const crearContacto = async () => {
  try {
    const payload = {
      codigo: Date.now().toString(),
      tipo: newTipo,
      nombre: newNombre,
      numero: newNumero,
      correo: newCorreo
    };

    console.log("ENVIANDO:", payload);

await fetch(GOOGLE_SCRIPT_URL, {
  method: "POST",
  body: JSON.stringify(payload)
});

    setShowCreate(false);

    setNewNombre("");
    setNewNumero("");
    setNewCorreo("");
    setNewTipo("c");

  } catch (e) {
    console.log("ERROR:", e);
  }

  loadClientes(token);

};

  /* ================= FILTRO ================= */
  const safeClientes = Array.isArray(clientes) ? clientes : [];

const filtered = safeClientes
  .filter(c => {
    const ok =
      (c.nombre || "").toLowerCase().includes(busqueda.toLowerCase()) ||
      (c.numero || "").includes(busqueda) ||
      (c.correo || "").toLowerCase().includes(busqueda.toLowerCase());

    if (!ok) return false;

    if (filtro === "todos") return true;
    if (filtro === "fav") return fav.includes(c.codigo);

    return c.tipo === filtro;
  })
  .sort((a, b) => {
    const aFav = fav.includes(a.codigo) ? 1 : 0;
    const bFav = fav.includes(b.codigo) ? 1 : 0;

    // ⭐ favoritos primero
    if (aFav !== bFav) return bFav - aFav;

    // 🔤 ordenar por nombre
    return (a.nombre || "").localeCompare(b.nombre || "");
  });

  const openEdit = (item) => {
  setEditCodigo(item.codigo);
  setEditNombre(item.nombre);
  setEditNumero(item.numero);
  setEditCorreo(item.correo);
  setEditTipo(item.tipo);

  setEditModal(true);
};

const guardarEdit = async () => {
  try {
    const payload = {
      accion: "update",
      codigo: editCodigo,
      tipo: editTipo,
      nombre: editNombre,
      numero: editNumero,
      correo: editCorreo
    };

    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(payload)
    });

    setEditModal(false);
    loadClientes(token);

  } catch (e) {
    console.log("ERROR EDIT:", e);
  }
};

  /* ================= LOGIN SCREEN ================= */
if (!token) {
  return (
    <View style={[styles.login, { backgroundColor: t.bg }]}>

      <Text style={[styles.title, { color: t.text }]}>Login</Text>

      <TextInput
        placeholder="Usuario"
        placeholderTextColor={t.sub}
        value={user}              // ✅ FIX
        style={[styles.input, { backgroundColor: t.card, color: t.text }]}
        onChangeText={setUser}
      />

      <TextInput
        placeholder="Contraseña"
        placeholderTextColor={t.sub}
        secureTextEntry
        value={pass}              // ✅ FIX
        style={[styles.input, { backgroundColor: t.card, color: t.text }]}
        onChangeText={setPass}
      />

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: t.accent }]}
        onPress={login}
      >
        <Text style={{ color: "#fff" }}>Entrar</Text>
      </TouchableOpacity>

    </View>
  );
}

/* ================= APP ================= */
return (
  <View style={[styles.container, { backgroundColor: t.bg }]}>

    {/* TOP */}
    <View style={{
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10
    }}>
      <TouchableOpacity style={styles.addBtn} onPress={() => setShowCreate(true)}>
        <Text style={styles.addText}>＋</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>

    {/* SEARCH */}
    <TextInput
      placeholder="Buscar..."
      placeholderTextColor={t.sub}
      value={busqueda}
      style={[styles.search, { backgroundColor: t.card, color: t.text }]}
      onChangeText={setBusqueda}
    />

    {/* FILTERS */}
    <View style={styles.filters}>
      {["todos", "fav", "c", "o", "s", "e", "p"].map(f => (
        <TouchableOpacity key={f} onPress={() => setFiltro(f)}>
          <Text style={{
            color: filtro === f ? t.accent : t.text,
            fontWeight: filtro === f ? "bold" : "normal"
          }}>
            {f === "c" ? "Clientes"
              : f === "o" ? "Otros"
              : f === "s" ? "Spam"
              : f === "e" ? "Exclientes"
              : f === "p" ? "Personal"
              : f === "fav" ? "Favoritos"
              : "Todos"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>

    {/* LISTA */}
    <FlatList
      data={filtered}
      keyExtractor={i => i.codigo}
      renderItem={({ item }) => (
        <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}>

          {/* INFO */}
          <Text style={[styles.name, { color: t.text }]}>
            {item.nombre}
          </Text>

          <Text style={[styles.num, { color: t.sub }]}>
            {item.numero}
          </Text>

          <Text style={[styles.mail, { color: t.sub }]}>
            {item.correo}
          </Text>

          <Text style={[styles.type, { color: t.sub }]}>
            {TIPO[item.tipo] || "Otros"}
          </Text>

          {/* ICONOS */}
          <View style={styles.icons}>

            <TouchableOpacity onPress={() => openAction(item.numero, "tel")}>
              <Text style={styles.icon}>📞</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => openAction(item.numero, "wa")}>
              <Text style={styles.icon}>💬</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => run(item.correo, "mail")}>
              <Text style={styles.icon}>📧</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => openEdit(item)}>
              <Text style={styles.icon}>⚙️</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => toggleFav(item.codigo)}>
              <Text style={[styles.icon, {
                color: fav.includes(item.codigo) ? "#facc15" : t.text
              }]}>
                {fav.includes(item.codigo) ? "⭐" : "☆"}
              </Text>
            </TouchableOpacity>

            {/* 📝 ABRIR NOTA */}
            <TouchableOpacity
              onPress={() => {
                if (notaOpen === item.codigo) {
                  setNotaOpen(null);
                } else {
                  setNotaOpen(item.codigo);
                  setNotaEdit(notas[item.codigo] || "");
                }
              }}
            >
              <Text style={styles.icon}>📝</Text>
            </TouchableOpacity>

          </View>

          {/* 🟡 EDITOR DE NOTA DENTRO DE LA CARD */}
          {notaOpen === item.codigo && (
            <View style={{
              marginTop: 10,
              padding: 10,
              borderRadius: 10,
              backgroundColor: dark ? "#1f2937" : "#f3f4f6"
            }}>

              <TextInput
                value={notaEdit}
                onChangeText={setNotaEdit}
                multiline
                placeholder="Escribe una nota..."
                placeholderTextColor={t.sub}
                style={{
                  height: 100,
                  color: t.text,
                  textAlignVertical: "top"
                }}
              />

              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>

                <TouchableOpacity
                  onPress={async () => {
                    await fetch(API + "/notas", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        token
                      },
                      body: JSON.stringify({
                        codigo: item.codigo,
                        nota: notaEdit
                      })
                    });

                    setNotas(prev => ({
                      ...prev,
                      [item.codigo]: notaEdit
                    }));

                    setNotaOpen(null);
                  }}
                >
                  <Text style={{ color: "#22c55e", fontWeight: "bold" }}>
                    Guardar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setNotaOpen(null)}>
                  <Text style={{ color: "#ff4d4d", fontWeight: "bold" }}>
                    Cancelar
                  </Text>
                </TouchableOpacity>

              </View>

            </View>
          )}

          {/* NOTA YA GUARDADA */}
          {notas[item.codigo] && notaOpen !== item.codigo && (
            <View style={{
              marginTop: 10,
              padding: 8,
              borderRadius: 8,
              backgroundColor: dark ? "#111827" : "#eef2ff"
            }}>
              <Text style={{ color: t.text }}>
                {notas[item.codigo]}
              </Text>
            </View>
          )}

        </View>
      )}
    />

    {/* ================= MODAL NUMEROS ================= */}
<Modal visible={modal} transparent animationType="fade">
  <View style={styles.modalBg}>
    <View style={[styles.modalBox, { backgroundColor: t.card }]}>

      <Text style={[styles.modalTitle, { color: t.text }]}>
        Selecciona un número
      </Text>

      {nums.map((n, i) => (
        <TouchableOpacity
          key={i}
          style={[
            styles.numBtn,
            {
              backgroundColor: dark ? "#2a2a3a" : "#f2f2f2",
              borderWidth: 1,
              borderColor: t.border
            }
          ]}
          onPress={() => {
            run(n, accion);
            setModal(false);
          }}
        >
          <Text style={{ color: t.text, fontSize: 16 }}>
            {n}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        onPress={() => setModal(false)}
        style={[styles.cancelBtn, { marginTop: 5 }]}
      >
        <Text style={{ color: "#ff4d4d", fontWeight: "600" }}>
          Cancelar
        </Text>
      </TouchableOpacity>

    </View>
  </View>
</Modal>

    {/* ================= MODAL CREAR ================= */}
<Modal visible={showCreate} transparent animationType="fade">
  <View style={styles.modalBg}>

    <View style={[styles.modalBox, { backgroundColor: t.card }]}>

      <Text style={[styles.modalTitle, { color: t.text }]}>
        Nuevo contacto
      </Text>

      <TextInput
        placeholder="Nombre"
        placeholderTextColor={t.sub}
        style={[
          styles.input,
          {
            backgroundColor: dark ? "#2a2a3a" : "#f2f2f2",
            color: t.text
          }
        ]}
        value={newNombre}
        onChangeText={setNewNombre}
      />

      <TextInput
        placeholder="Número (usa , para varios)"
        placeholderTextColor={t.sub}
        keyboardType="numeric"
        style={[
          styles.input,
          {
            backgroundColor: dark ? "#2a2a3a" : "#f2f2f2",
            color: t.text
          }
        ]}
        value={newNumero}
        onChangeText={(text) =>
          setNewNumero(text.replace(/[^0-9,]/g, ""))
        }
      />

      <TextInput
        placeholder="Correo"
        placeholderTextColor={t.sub}
        style={[
          styles.input,
          {
            backgroundColor: dark ? "#2a2a3a" : "#f2f2f2",
            color: t.text
          }
        ]}
        value={newCorreo}
        onChangeText={setNewCorreo}
      />

      {/* TIPOS */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
        {[
          { label: "Clientes", val: "c" },
          { label: "Otros", val: "o" },
          { label: "Spam", val: "s" },
          { label: "Exclientes", val: "e" },
          { label: "Personal", val: "p" }
        ].map((tpo) => (
          <TouchableOpacity
            key={tpo.val}
            onPress={() => setNewTipo(tpo.val)}
            style={{
              backgroundColor: newTipo === tpo.val ? "#3b82f6" : "#555",
              paddingVertical: 6,
              paddingHorizontal: 10,
              borderRadius: 10
            }}
          >
            <Text style={{ color: "#fff" }}>{tpo.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* BOTON CREAR */}
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: "#22c55e", marginTop: 15 }]}
        onPress={crearContacto}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>
          Crear
        </Text>
      </TouchableOpacity>

      {/* CANCELAR */}
      <TouchableOpacity onPress={() => setShowCreate(false)}>
        <Text style={{ color: "#ff4d4d", textAlign: "center", marginTop: 10 }}>
          Cancelar
        </Text>
      </TouchableOpacity>

    </View>
  </View>
</Modal>

    {/* ================= MODAL EDIT ================= */}
<Modal visible={editModal} transparent animationType="fade">
  <View style={styles.modalBg}>
    <View style={[styles.modalBox, { backgroundColor: t.card }]}>

      <Text style={[styles.modalTitle, { color: t.text }]}>
        Editar contacto
      </Text>

      <TextInput
        placeholder="Nombre"
        placeholderTextColor={t.sub}
        style={[
          styles.input,
          {
            backgroundColor: dark ? "#2a2a3a" : "#f2f2f2",
            color: t.text
          }
        ]}
        value={editNombre}
        onChangeText={setEditNombre}
      />

      <TextInput
        placeholder="Número"
        placeholderTextColor={t.sub}
        keyboardType="numeric"
        style={[
          styles.input,
          {
            backgroundColor: dark ? "#2a2a3a" : "#f2f2f2",
            color: t.text
          }
        ]}
        value={editNumero}
        onChangeText={(text) =>
          setEditNumero(text.replace(/[^0-9,]/g, ""))
        }
      />

      <TextInput
        placeholder="Correo"
        placeholderTextColor={t.sub}
        style={[
          styles.input,
          {
            backgroundColor: dark ? "#2a2a3a" : "#f2f2f2",
            color: t.text
          }
        ]}
        value={editCorreo}
        onChangeText={setEditCorreo}
      />

      {/* TIPOS (igual que crear) */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
        {[
          { label: "Clientes", val: "c" },
          { label: "Otros", val: "o" },
          { label: "Spam", val: "s" },
          { label: "Exclientes", val: "e" },
          { label: "Personal", val: "p" }
        ].map((tpo) => (
          <TouchableOpacity
            key={tpo.val}
            onPress={() => setEditTipo(tpo.val)}
            style={{
              backgroundColor: editTipo === tpo.val ? "#3b82f6" : "#555",
              paddingVertical: 6,
              paddingHorizontal: 10,
              borderRadius: 10
            }}
          >
            <Text style={{ color: "#fff" }}>{tpo.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* BOTÓN GUARDAR */}
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: "#22c55e", marginTop: 15 }]}
        onPress={guardarEdit}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>
          Guardar cambios
        </Text>
      </TouchableOpacity>

      {/* CANCELAR */}
      <TouchableOpacity onPress={() => setEditModal(false)}>
        <Text style={{ color: "#ff4d4d", textAlign: "center", marginTop: 10 }}>
          Cancelar
        </Text>
      </TouchableOpacity>

    </View>
  </View>
</Modal>

    {/* ================= MODAL NOTA ================= */}
<Modal visible={notaOpen !== null} transparent animationType="fade">
  <View style={styles.modalBg}>
    <View style={[styles.modalBox, { backgroundColor: t.card }]}>

      <Text style={[styles.modalTitle, { color: t.text }]}>
        Nota
      </Text>

      <TextInput
        value={notaEdit}
        onChangeText={setNotaEdit}
        multiline
        placeholder="Escribe una nota..."
        placeholderTextColor={t.sub}
        style={[
          styles.input,
          {
            height: 120,
            textAlignVertical: "top",
            backgroundColor: dark ? "#2a2a3a" : "#f2f2f2",
            color: t.text,
            borderWidth: 1,
            borderColor: t.border
          }
        ]}
      />

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: "#3b82f6" }]}
        onPress={async () => {
          await fetch(API + "/notas", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              token
            },
            body: JSON.stringify({
              codigo: notaOpen,
              nota: notaEdit
            })
          });

          setNotas(prev => ({
            ...prev,
            [notaOpen]: notaEdit
          }));

          setNotaOpen(null);
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>
          Guardar
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setNotaOpen(null)}>
        <Text style={{ color: "#ff4d4d", textAlign: "center", marginTop: 10 }}>
          Cancelar
        </Text>
      </TouchableOpacity>

    </View>
  </View>
</Modal>

  </View>
);
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({

  container: { flex: 1, padding: 15, paddingTop: 20 },

  login: { flex: 1, justifyContent: "center", padding: 20 },

  title: { fontSize: 28, marginBottom: 20, fontWeight: "bold" },

  input: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 10
  },

  btn: {
    padding: 14,
    borderRadius: 10,
    alignItems: "center"
  },

  top: { marginBottom: 10 },

  search: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 10
  },

  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10
  },

  card: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1
  },

  name: { fontSize: 32, fontWeight: "bold" },
  num: { fontSize: 20 },
  mail: { fontSize: 20 },
  type: { fontSize: 16 },

  icons: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 10,
    gap: 12
  },

  icon: { fontSize: 32 },

  modalBg: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0008"
  },

  modalBox: {
    width: "70%",
    borderRadius: 10,
    padding: 10
  },

  modalTitle: {
  fontSize: 20,
  fontWeight: "bold",
  marginBottom: 15,
  textAlign: "center"
},

numBtn: {
  padding: 14,
  borderRadius: 10,
  marginBottom: 10,
  alignItems: "center"
},

cancelBtn: {
  marginTop: 10,
  padding: 10,
  alignItems: "center"
},

logoutBtn: {
  alignSelf: "flex-start",
  paddingVertical: 8,
  paddingHorizontal: 14,
  borderRadius: 10,
  marginBottom: 10,
  backgroundColor: "#c90404"
},

logoutText: {
  color: "#fff",
  fontWeight: "600",
  fontSize: 14
},

addBtn: {
  backgroundColor: "#22c55e",
  paddingHorizontal: 14,
  paddingVertical: 6,
  borderRadius: 10
},

addText: {
  color: "#fff",
  fontSize: 20,
  fontWeight: "bold"
}
});