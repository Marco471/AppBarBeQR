// src/screens/PrecosScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { db } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function PrecosScreen() {
  const [precos, setPrecos] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarPrecos = async () => {
      try {
        const docRef = doc(db, "precos", "servicos");
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          console.log("📄 Dados recebidos do Firebase:", snapshot.data());
          setPrecos(snapshot.data());
        } else {
          console.log("⚠️ Documento de preços não encontrado!");
        }
      } catch (error) {
        console.error("Erro ao carregar preços:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarPrecos();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#001F54" />
        <Text style={styles.texto}>Carregando preços...</Text>
      </View>
    );
  }

  if (!precos) {
    return (
      <View style={styles.container}>
        <Text style={styles.texto}>Nenhum preço disponível no momento.</Text>
      </View>
    );
  }

  // Converte o timestamp do Firebase
  const dataAtualizacao = precos.atualizadoEm?.seconds
    ? new Date(precos.atualizadoEm.seconds * 1000)
    : null;

  const dataFormatada = dataAtualizacao
    ? dataAtualizacao.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
    : "Data não disponível";

  return (
    <ScrollView style={styles.scroll}>
      <View style={styles.container}>
        <Text style={styles.titulo}>💈 Tabela de Preços</Text>

        <Text style={styles.item}>✂️ Barba Tradicional: R$ {precos.barba}</Text>
        <Text style={styles.item}>💇 Cabelo + Barba: R$ {precos.cabeloBarba}</Text>
        <Text style={styles.item}>🎨 Platinado: R$ {precos.platinado}</Text>
        <Text style={styles.item}>📅 Corte (terça a quinta): R$ {precos.corteSemana}</Text>
        <Text style={styles.item}>🔥 Corte (sexta e sábado): R$ {precos.corteFim}</Text>

        <Text style={styles.atualizacao}>🕓 Atualizado em: {dataFormatada}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#f0f4f8",
  },
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#001F54",
    marginBottom: 20,
  },
  item: {
    fontSize: 18,
    color: "#333",
    marginVertical: 8,
  },
  atualizacao: {
    marginTop: 25,
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  texto: {
    fontSize: 16,
    color: "#444",
    marginTop: 10,
  },
});


