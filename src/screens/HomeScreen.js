import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { auth } from '../firebase/firebaseConfig';

const { width: screenWidth } = Dimensions.get('window');

const services = [
  { id: '1', name: 'Corte (terça a quinta)', price: '35$' },
  { id: '2', name: 'Corte (sexta e sábado)', price: '40$' },
  { id: '3', name: 'Barba tradicional', price: '25$' },
  { id: '4', name: 'Cabelo + Barba', price: '60$' },
  { id: '5', name: 'Platinado', price: '120$' },
];

export default function HomeScreen({ navigation }) {
  const renderService = ({ item }) => (
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
  );

  const handleLogout = () => {
    auth.signOut().then(() => navigation.replace('Login'));
  };

  return (
    <FlatList
      data={services}
      keyExtractor={(item) => item.id}
      renderItem={renderService}
      contentContainerStyle={{ paddingBottom: 20, paddingTop: 20 }}
      ListHeaderComponent={
        <View style={styles.header}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="cover" />
          <Text style={styles.logoName}>Lucas Firmino</Text>
          <Text style={styles.logoText}>Barbearia</Text>

          {/* Botão logout */}
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      }
      ListFooterComponent={
        <View style={{ alignItems: 'center', marginTop: 10, marginBottom: 40 }}>
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
  header: { alignItems: 'center', marginBottom: 20 },
  logo: { width: screenWidth, height: screenWidth * 0.55 }, // Logo menor
  logoName: { textAlign: 'center', fontSize: 24, fontWeight: 'bold', color: '#001F54', marginTop: 10 },
  logoText: { textAlign: 'center', fontSize: 22, fontWeight: '600', color: '#001F54', marginTop: 2 },
  logoutButton: { marginTop: 10, backgroundColor: '#FF3B30', paddingVertical: 6, paddingHorizontal: 15, borderRadius: 8 },
  logoutText: { color: '#fff', fontWeight: 'bold' },
  meusAgendamentosButton: { backgroundColor: '#001F54', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  meusAgendamentosText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  serviceItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9', padding: 10, borderRadius: 10, marginBottom: 10 },
  serviceName: { fontSize: 14, fontWeight: '600', color: '#000' },
  servicePrice: { fontSize: 12, color: '#001F54' },
  agendarButton: { backgroundColor: '#001F54', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  agendarText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
});
