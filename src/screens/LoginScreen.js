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
import { auth } from "../firebase/firebaseConfig";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleLogin = () => {
    if (!email || !password) {
      setModalMessage("Preencha todos os campos!");
      setModalVisible(true);
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        navigation.replace("Home");
      })
      .catch(() => {
        setModalMessage("Email ou senha inválidos!");
        setModalVisible(true);
      });
  };

  const handlePasswordReset = () => {
    if (!email) {
      setModalMessage("Digite seu e-mail para recuperar a senha.");
      setModalVisible(true);
      return;
    }

    sendPasswordResetEmail(auth, email)
      .then(() => {
        setModalMessage(
          "Um link para redefinir sua senha foi enviado para o e-mail informado."
        );
        setModalVisible(true);
      })
      .catch(() => {
        setModalMessage(
          "Não foi possível enviar o e-mail. Verifique o endereço e tente novamente."
        );
        setModalVisible(true);
      });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* Nome da Barbearia */}
          <Text style={styles.title}>Lucas Firmino Barbearia</Text>

          {/* Inputs */}
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
          />

          {/* Botão Login */}
          <TouchableOpacity style={styles.buttonSmall} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <View style={{ height: 10 }} />

          {/* Botão Cadastrar */}
          <TouchableOpacity
            style={styles.buttonSmall}
            onPress={() => navigation.navigate("Cadastro")}
          >
            <Text style={styles.buttonText}>Cadastrar</Text>
          </TouchableOpacity>

          <View style={{ height: 15 }} />

          {/* Texto Esqueci minha senha */}
          <TouchableOpacity onPress={handlePasswordReset}>
            <Text style={styles.linkText}>Esqueci minha senha</Text>
          </TouchableOpacity>
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
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  linkText: {
    color: "#000",
    fontSize: 14,
    textAlign: "center",
    textDecorationLine: "underline",
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
