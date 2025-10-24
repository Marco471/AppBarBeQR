import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

const services = [
  { id: '1', name: 'Corte', price: '35$' },
  { id: '2', name: 'Barba', price: '25$' },
  { id: '3', name: 'Cabelo + Barba', price: '60$' },
  { id: '4', name: 'Platinado', price: '120$' },
];

export default function PrecosScreen({ navigation }) {
  return (
    <FlatList
      data={services}
      keyExtractor={item => item.id}
      contentContainerStyle={{ padding: 20 }}
      renderItem={({ item }) => (
        <View style={styles.serviceItem}>
          <Text style={styles.serviceName}>{item.name}</Text>
          <Text style={styles.servicePrice}>{item.price}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Agendamento', { servico: item })}
          >
            <Text style={styles.buttonText}>Agendar</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  serviceItem: {
    backgroundColor: '#F9F9F9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  servicePrice: {
    fontSize: 14,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#001F54',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
