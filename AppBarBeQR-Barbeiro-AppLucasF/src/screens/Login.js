import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert("Erro", "Digite o e-mail e a senha.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, senha);
      navigation.replace("Agendamentos");
    } catch (error) {
      Alert.alert("Erro ao entrar", "E-mail ou senha incorretos.");
      console.log(error);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Aviso", "Digite seu e-mail para recuperar a senha.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "E-mail enviado",
        "Verifique sua caixa de entrada (ou spam) para redefinir a senha."
      );
    } catch (error) {
      Alert.alert("Erro", "Não foi possível enviar o e-mail de recuperação.");
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lucas Firmino Barbearia</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#aaa"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleForgotPassword}>
        <Text style={styles.forgotText}>Esqueci minha senha</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#001f3f", // Azul marinho escuro
    marginBottom: 40,
    textAlign: "center",
  },
  input: {
    width: "90%",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    width: "90%",
    backgroundColor: "#001f3f", // Azul marinho escuro
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff", // Branco
    fontSize: 18,
    fontWeight: "bold",
  },
  forgotText: {
    marginTop: 15,
    color: "#000",
    fontSize: 16,
    textDecorationLine: "underline",
  },
});

