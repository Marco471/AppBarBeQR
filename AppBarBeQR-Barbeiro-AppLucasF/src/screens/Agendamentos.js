import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { db, auth } from "../firebase/firebaseConfig";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export default function AgendamentosBarbeiro({ navigation }) {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Função para buscar todos os agendamentos
  const buscarAgendamentos = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "agendamentos"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAgendamentos(lista);
      setLoading(false);
    } catch (error) {
      console.log("Erro ao buscar agendamentos:", error);
      setLoading(false);
      Alert.alert("Erro", "Não foi possível carregar os agendamentos.");
    }
  };

  // Checa se usuário está logado
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigation.navigate("Login");
      } else {
        buscarAgendamentos();
      }
    });
    return unsubscribe;
  }, []);

  // Botão Sair
  const handleSair = async () => {
    try {
      await auth.signOut();
      navigation.navigate("Login");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível sair. Tente novamente.");
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.nome}>{item.nome} - {item.servico}</Text>
      <Text style={styles.info}>{item.dia}/{item.mes}/{item.ano} - {item.hora}</Text>
      <Text style={styles.info}>Telefone: {item.telefone}</Text>
      <Text style={styles.info}>Preço: {item.preco}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Agendamentos</Text>
        <TouchableOpacity style={styles.sairButton} onPress={handleSair}>
          <Text style={styles.sairText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#001F54" style={{ marginTop: 50 }} />
      ) : agendamentos.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 50 }}>Nenhum agendamento encontrado.</Text>
      ) : (
        <FlatList
          data={agendamentos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#001F54",
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#FFF" },
  sairButton: { backgroundColor: "#FFF", padding: 8, borderRadius: 5 },
  sairText: { color: "#001F54", fontWeight: "bold" },
  item: {
    backgroundColor: "#F5F5F5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  nome: { fontSize: 16, fontWeight: "bold", color: "#001F54" },
  info: { fontSize: 14, marginTop: 3, color: "#333" },
});
