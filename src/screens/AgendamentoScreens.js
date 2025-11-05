import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  ScrollView,
} from "react-native";
import { CalendarList, LocaleConfig } from "react-native-calendars";
import { db, auth } from "../firebase/firebaseConfig";
import { collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";

// Configuração do calendário em português
LocaleConfig.locales["pt"] = {
  monthNames: [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ],
  monthNamesShort: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
  dayNames: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
  dayNamesShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
  today: "Hoje",
};
LocaleConfig.defaultLocale = "pt";

export default function AgendamentoScreen({ route, navigation }) {
  const { servico } = route.params;

  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [usuarioLogado, setUsuarioLogado] = useState(false);
  const [horariosOcupados, setHorariosOcupados] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) setUsuarioLogado(true);
    else {
      Alert.alert("Erro", "Usuário não logado!");
      navigation.navigate("Login");
    }

    // Inicia o lembrete de agendamentos próximos
    const timer = setInterval(() => {
      verificarAgendamentosProximos();
    }, 60 * 1000); // checa a cada 1 minuto

    return () => clearInterval(timer);
  }, []);

  const gerarHorarios = () => {
    const horarios = [];
    let horaAtual = 10;
    let minutoAtual = 0;
    while (horaAtual < 20 || (horaAtual === 20 && minutoAtual === 0)) {
      const horaFormatada = `${horaAtual.toString().padStart(2, "0")}:${minutoAtual.toString().padStart(2, "0")}`;
      horarios.push(horaFormatada);
      minutoAtual += 45;
      if (minutoAtual >= 60) {
        minutoAtual -= 60;
        horaAtual += 1;
      }
    }
    return horarios;
  };

  const horariosDisponiveis = gerarHorarios();

  const buscarHorariosOcupados = async (dataSelecionada) => {
    const [ano, mes, dia] = dataSelecionada.split("-");
    const q = query(
      collection(db, "agendamentos"),
      where("dia", "==", dia),
      where("mes", "==", mes),
      where("ano", "==", ano)
    );
    const snapshot = await getDocs(q);
    const ocupados = snapshot.docs.map((doc) => ({
      hora: doc.data().hora,
      userId: doc.data().userId,
    }));
    setHorariosOcupados(ocupados);
  };

  const handleAgendar = async () => {
    if (!nome || !telefone || !data || !hora) {
      Alert.alert("Erro", "Preencha todos os campos e escolha data e horário.");
      return;
    }

    if (!usuarioLogado) {
      Alert.alert("Erro", "Você precisa estar logado para agendar.");
      return;
    }

    const [ano, mes, dia] = data.split("-");

    const q = query(
      collection(db, "agendamentos"),
      where("dia", "==", dia),
      where("mes", "==", mes),
      where("ano", "==", ano),
      where("hora", "==", hora)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      Alert.alert("Horário Indisponível", "Este horário já está ocupado. Escolha outro.");
      return;
    }

    try {
      await addDoc(collection(db, "agendamentos"), {
        nome,
        telefone,
        dia,
        mes,
        ano,
        hora,
        servico: servico.name,
        preco: servico.price,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });

      Alert.alert("✅ Sucesso", "Agendamento realizado com sucesso!");
      navigation.navigate("Home");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível agendar. Tente novamente.");
      console.log(error);
    }
  };

  // Função que verifica agendamentos próximos do horário atual
  const verificarAgendamentosProximos = async () => {
    const agora = new Date();
    const [ano, mes, dia] = [
      agora.getFullYear().toString(),
      (agora.getMonth() + 1).toString(),
      agora.getDate().toString()
    ];

    const q = query(
      collection(db, "agendamentos"),
      where("ano", "==", ano),
      where("mes", "==", mes),
      where("dia", "==", dia),
      where("userId", "==", auth.currentUser.uid)
    );

    const snapshot = await getDocs(q);
    snapshot.docs.forEach((doc) => {
      const agendamento = doc.data();
      const [horaAg, minAg] = agendamento.hora.split(":").map(Number);
      const horarioAgendamento = new Date();
      horarioAgendamento.setHours(horaAg, minAg, 0, 0);

      if (horarioAgendamento - agora > 0 && horarioAgendamento - agora <= 15 * 60 * 1000) {
        Alert.alert(
          "⏰ Lembrete",
          `Seu agendamento de ${agendamento.servico} é às ${agendamento.hora}`
        );
      }
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#FFF" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text style={styles.title}>Agendar: {servico.name}</Text>
        <Text style={styles.label}>Preço: {servico.price}</Text>

        <TextInput
          style={styles.input}
          placeholder="Seu nome"
          value={nome}
          onChangeText={setNome}
        />
        <TextInput
          style={styles.input}
          placeholder="Telefone"
          value={telefone}
          onChangeText={setTelefone}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Escolha a data:</Text>
        <CalendarList
          horizontal
          pagingEnabled
          onDayPress={(day) => {
            setData(day.dateString);
            setHora("");
            buscarHorariosOcupados(day.dateString);
          }}
          markedDates={data ? { [data]: { selected: true, selectedColor: "#001F54" } } : {}}
          pastScrollRange={0}
          futureScrollRange={3}
        />

        {data && (
          <>
            <Text style={styles.label}>Escolha o horário:</Text>
            <FlatList
              data={horariosDisponiveis}
              horizontal
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const ocupado = horariosOcupados.find((h) => h.hora === item);
                return (
                  <TouchableOpacity
                    style={[
                      styles.horarioButton,
                      {
                        backgroundColor: ocupado
                          ? "#CCC"
                          : item === hora
                          ? "#28A745"
                          : "#001F54",
                      },
                    ]}
                    onPress={() => setHora(item)}
                  >
                    <Text style={styles.horarioText}>{item}</Text>
                  </TouchableOpacity>
                );
              }}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 10 }}
            />
          </>
        )}

        <View style={{ alignItems: 'center', marginTop: 30 }}>
          <TouchableOpacity style={styles.confirmButton} onPress={handleAgendar}>
            <Text style={styles.confirmText}>Confirmar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10, color: "#001F54" },
  label: { fontSize: 16, marginVertical: 10, color: "#001F54" },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  horarioButton: {
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  horarioText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  confirmButton: {
    backgroundColor: "#001F54",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  confirmText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
});



