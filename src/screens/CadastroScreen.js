import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { auth, db } from "../firebase/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function CadastroScreen({ navigation }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [password, setPassword] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleCadastro = async () => {
    if (!nome || !email || !telefone || !password) {
      setModalMessage("Preencha todos os campos!");
      setModalVisible(true);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "usuarios", user.uid), {
        nome,
        email,
        telefone,
      });

      setModalMessage("Cadastro realizado com sucesso!");
      setModalVisible(true);

      setTimeout(() => {
        setModalVisible(false);
        navigation.replace("Home");
      }, 1500);
    } catch (error) {
      setModalMessage("Erro ao cadastrar. Tente novamente!");
      setModalVisible(true);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.title}>Criar Conta</Text>

          <TextInput
            placeholder="Nome completo"
            value={nome}
            onChangeText={setNome}
            style={styles.input}
          />

          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            placeholder="Telefone"
            value={telefone}
            onChangeText={setTelefone}
            style={styles.input}
            keyboardType="phone-pad"
          />

          <TextInput
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
          />

          <TouchableOpacity style={styles.buttonSmall} onPress={handleCadastro}>
            <Text style={styles.buttonText}>Cadastrar</Text>
          </TouchableOpacity>

          <View style={{ height: 15 }} />

          <TouchableOpacity
            style={styles.buttonSmall}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.buttonText}>Voltar para Login</Text>
          </TouchableOpacity>

          {/* Espaço extra para quando o teclado estiver aberto */}
          <View style={{ height: 80 }} />
        </View>

        {/* Modal de Mensagem */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>{modalMessage}</Text>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#001F54",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 15,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  buttonSmall: {
    backgroundColor: "#001F54",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 25,
    width: "80%",
    alignItems: "center",
  },
  modalText: {
    fontSize: 16,
    color: "#001F54",
    textAlign: "center",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#001F54",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

