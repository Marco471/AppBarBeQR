// src/screens/HomeScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { auth, db } from '../firebase/firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';

const { width: screenWidth } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [services, setServices] = useState([]);

  // 🔥 Busca preços em tempo real do Firestore
  useEffect(() => {
    const docRef = doc(db, "precos", "tabela");

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          console.log("📄 Dados recebidos do Firebase:", data);

          // ✅ Corrigido: nomes das chaves exatamente como estão no Firestore
          const mappedServices = [
            { id: "1", name: "Corte (terça a quinta)", price: `R$ ${data.corteSemana || "--"}` },
            { id: "2", name: "Corte (sexta e sábado)", price: `R$ ${data.corteFim || "--"}` },
            { id: "3", name: "Barba Tradicional", price: `R$ ${data.barba || "--"}` },
            { id: "4", name: "Cabelo + Barba", price: `R$ ${data.cabeloBarba || "--"}` },
            { id: "5", name: "Platinado", price: `R$ ${data.platinado || "--"}` },
          ];

          setServices(mappedServices);
        } else {
          console.log("⚠️ Documento 'precos/tabela' não encontrado");
        }
      },
      (error) => {
        console.error("❌ Erro ao ler preços:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth.signOut().then(() => navigation.replace('Login'));
  };

  return (
    <FlatList
      data={services}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.serviceItem}>
          <View style={{ flex: 1 }}>
            <Text style={styles.serviceName}>{item.name}</Text>
            <Text style={styles.servicePrice}>{item.price}</Text>
          </View>
          <TouchableOpacity
            style={styles.agendarButton}
            onPress={() => navigation.navigate('Agendamento', { servico: item })}
          >
            <Text style={styles.agendarText}>Agendar</Text>
          </TouchableOpacity>
        </View>
      )}
      contentContainerStyle={{ paddingBottom: 20, paddingTop: 20 }}
      ListHeaderComponent={
        <View style={styles.header}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="cover"
          />
          <Text style={styles.logoName}>Lucas Firmino</Text>
          <Text style={styles.logoText}>Barbearia</Text>

          {/* Botão Logout */}
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      }
      ListFooterComponent={
        <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 40 }}>
          <TouchableOpacity
            style={styles.meusAgendamentosButton}
            onPress={() => navigation.navigate("MeusAgendamentos")}
          >
            <Text style={styles.meusAgendamentosText}>Cancelar Agendamentos</Text>
          </TouchableOpacity>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: screenWidth,
    height: screenWidth * 0.55,
  },
  logoName: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#001F54',
    marginTop: 10,
  },
  logoText: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '600',
    color: '#001F54',
    marginTop: 2,
  },
  logoutButton: {
    marginTop: 10,
    backgroundColor: '#FF3B30',
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  meusAgendamentosButton: {
    backgroundColor: '#001F54',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  meusAgendamentosText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  servicePrice: {
    fontSize: 12,
    color: '#001F54',
  },
  agendarButton: {
    backgroundColor: '#001F54',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  agendarText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
