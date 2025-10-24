import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { db, auth } from "../firebase/firebaseConfig";
import { collection, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";

export default function MeusAgendamentos({ navigation }) {
  const [agendamentos, setAgendamentos] = useState([]);

  useEffect(() => {
    buscarAgendamentos();
  }, []);

  const buscarAgendamentos = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Erro", "Usuário não logado!");
      navigation.navigate("Login");
      return;
    }

    const q = query(collection(db, "agendamentos"), where("userId", "==", user.uid));
    const snapshot = await getDocs(q);
    const lista = snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));
    setAgendamentos(lista);
  };

  const handleCancelar = async (id) => {
    Alert.alert(
      "Cancelar Agendamento",
      "Tem certeza que deseja cancelar este agendamento?",
      [
        { text: "Não", style: "cancel" },
        {
          text: "Sim",
          onPress: async () => {
            await deleteDoc(doc(db, "agendamentos", id));
            Alert.alert("✅ Sucesso", "Agendamento cancelado com sucesso!");
            buscarAgendamentos();
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.text}>🗓️ {item.dia}/{item.mes}/{item.ano}</Text>
      <Text style={styles.text}>⏰ {item.hora}</Text>
      <Text style={styles.text}>✂️ {item.servico}</Text>
      <Text style={styles.text}>💰 {item.preco}</Text>
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => handleCancelar(item.id)}
      >
        <Text style={styles.cancelText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meus Agendamentos</Text>
      <FlatList
        data={agendamentos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF", padding: 20 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#001F54",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#EAF0FF",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  text: { color: "#001F54", fontSize: 16, marginBottom: 5 },
  cancelButton: {
    backgroundColor: "#001F54",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
  },
  cancelText: { color: "#FFF", fontWeight: "bold" },
});
