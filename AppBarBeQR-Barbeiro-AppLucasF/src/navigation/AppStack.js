// src/navigation/AppStack.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import CadastroScreen from "../screens/CadastroScreen";
import HomeScreen from "../screens/HomeScreen";
import AgendamentoScreens from "../screens/AgendamentoScreens";
import MeusAgendamentos from "../screens/MeusAgendamentos";

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: { backgroundColor: "#001F54" },
        headerTintColor: "#FFF",
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Cadastro"
        component={CadastroScreen}
        options={{ title: "Cadastro" }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Dom Julios Barbearia" }}
      />
      <Stack.Screen
        name="Agendamento"
        component={AgendamentoScreens}
        options={{ title: "Agendar Horário" }}
      />
      <Stack.Screen
        name="MeusAgendamentos"
        component={MeusAgendamentos}
        options={{ title: "Meus Agendamentos" }}
      />
    </Stack.Navigator>
  );
}

