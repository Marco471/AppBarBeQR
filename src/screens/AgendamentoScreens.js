// AgendamentoScreen.js
import React, { useState, useEffect, useRef } from "react";
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
  Dimensions,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db, auth } from "../firebase/firebaseConfig";
import { collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";
import Icon from "react-native-vector-icons/FontAwesome";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ITEM_WIDTH = 68;

const pad = (n) => String(n).padStart(2, "0");
const toDateString = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Gera lista de dias: de 1 mês antes até +12 meses
function generateDays(monthsForward = 12) {
  const days = [];
  const start = new Date();
  start.setMonth(start.getMonth() - 1);
  start.setDate(1);

  const end = new Date();
  end.setMonth(end.getMonth() + monthsForward);
  end.setDate(0);

  let cur = new Date(start);
  while (cur <= end) {
    days.push(new Date(cur));
    cur = new Date(cur);
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

const WEEKDAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function AgendamentoScreen({ route, navigation }) {
  const { servico } = route.params || { servico: { name: "Serviço", price: "—" } };

  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [usuarioLogado, setUsuarioLogado] = useState(false);
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [headerMonthYear, setHeaderMonthYear] = useState("");

  const days = useRef(generateDays(12)).current;
  const daysRef = useRef(null);

  // Usuário logado
  useEffect(() => {
    const user = auth.currentUser;
    if (user) setUsuarioLogado(true);
    else navigation.navigate("Login");
  }, []);

  // Gera horários
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

  // Buscar horários ocupados
  const buscarHorariosOcupados = async (dataSelecionada) => {
    if (!dataSelecionada) {
      setHorariosOcupados([]);
      return;
    }
    try {
      const [ano, mes, dia] = dataSelecionada.split("-");
      const q = query(
        collection(db, "agendamentos"),
        where("dia", "==", dia),
        where("mes", "==", mes),
        where("ano", "==", ano)
      );
      const snapshot = await getDocs(q);
      const ocupados = snapshot.docs.map((doc) => doc.data().hora);
      setHorariosOcupados(ocupados);
    } catch (err) {
      console.log("Erro buscarHorariosOcupados:", err);
      setHorariosOcupados([]);
    }
  };

  // Agendar
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
    try {
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
    } catch (err) {
      console.log("Erro handleAgendar:", err);
      Alert.alert("Erro", "Não foi possível agendar. Tente novamente.");
    }
  };

  // Centralizar hoje ao montar
  useEffect(() => {
    const today = new Date();
    const todayStr = toDateString(today);
    setData(todayStr);
    buscarHorariosOcupados(todayStr);
    setHeaderMonthYear(`${today.toLocaleString("pt-BR", { month: "long" }).replace(/^./, (c) => c.toUpperCase())} ${today.getFullYear()}`);
    
    const idx = days.findIndex((d) => toDateString(d) === todayStr);
    if (idx >= 0 && daysRef.current) {
      setTimeout(() => {
        daysRef.current.scrollToIndex({ index: idx, animated: false });
      }, 50);
    }
  }, []);

  // Render dia
  const renderDay = ({ item }) => {
    const ds = toDateString(item);
    const selected = ds === data;
    const isPast = item < new Date(new Date().setHours(0, 0, 0, 0));
    return (
      <TouchableOpacity
        onPress={() => {
          if (!isPast) {
            setData(ds);
            setHora("");
            buscarHorariosOcupados(ds);

            // Atualiza o mês
            const monthName = item.toLocaleString("pt-BR", { month: "long" });
            setHeaderMonthYear(`${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${item.getFullYear()}`);
          }
        }}
        style={[styles.dayItem, selected && styles.daySelected, isPast && styles.dayPast]}
        activeOpacity={0.85}
      >
        <Text style={[styles.dayNumber, selected && styles.dayNumberSelected]}>{item.getDate()}</Text>
      </TouchableOpacity>
    );
  };

  // Render horário
  const renderHorario = ({ item }) => {
    const ocupado = horariosOcupados.includes(item);
    const selecionado = hora === item;
    let background = "#001F54";
    if (ocupado) background = "#555555";
    if (selecionado) background = "#CCCCCC";
    return (
      <TouchableOpacity
        style={[styles.horarioBox, { backgroundColor: background }]}
        onPress={() => !ocupado && setHora(item)}
        disabled={ocupado}
      >
        <Text style={[styles.horarioHora, selecionado && styles.horarioHoraSelected]}>{item}</Text>
        <Text style={[styles.horarioStatus, selecionado && styles.horarioStatusSelected]}>{ocupado ? "Ocupado" : "Livre"}</Text>
      </TouchableOpacity>
    );
  };

  // Abrir WhatsApp
  const openWhatsApp = () => {
    const phone = "5511941622764";
    const url = `https://wa.me/${phone}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("Erro", "Não foi possível abrir o WhatsApp");
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <View style={{ padding: 12 }}>
          <Text style={styles.title}>Agendar: {servico.name}</Text>
          <Text style={styles.label}>Preço: {servico.price}</Text>

          <TextInput
            style={styles.input}
            placeholder="Seu nome"
            value={nome}
            onChangeText={setNome}
            returnKeyType="next"
          />
          <TextInput
            style={styles.input}
            placeholder="Telefone"
            value={telefone}
            onChangeText={setTelefone}
            keyboardType="phone-pad"
            returnKeyType="done"
          />

          <Text style={[styles.label, { marginTop: 6 }]}>{headerMonthYear}</Text>

          {/* Nomes dias da semana */}
          <View style={styles.weekNames}>
            {WEEKDAY_NAMES.map((w) => (
              <Text key={w} style={styles.weekNameText}>{w}</Text>
            ))}
          </View>
        </View>

        <View style={{ height: 86 }}>
          <FlatList
            ref={daysRef}
            data={days}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => toDateString(item)}
            renderItem={renderDay}
            contentContainerStyle={{ paddingHorizontal: 8, alignItems: "center" }}
            getItemLayout={(data, index) => ({ length: ITEM_WIDTH, offset: ITEM_WIDTH * index, index })}
          />
        </View>

        {/* Horários */}
        <View style={{ paddingHorizontal: 12, paddingTop: 10 }}>
          <Text style={styles.label}>Horários:</Text>
          <FlatList
            data={horariosDisponiveis}
            horizontal
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 8 }}
            renderItem={renderHorario}
          />
        </View>

        {/* Footer */}
        <View style={{ height: 80 }} />
        <View style={styles.footer}>
          <TouchableOpacity style={styles.confirmButton} onPress={handleAgendar}>
            <Text style={styles.confirmText}>Confirmar</Text>
          </TouchableOpacity>
        </View>

        {/* Botão WhatsApp flutuante */}
        <TouchableOpacity style={styles.whatsappButton} onPress={openWhatsApp}>
          <Icon name="phone" size={20} color="#FFF" />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "700", marginBottom: 6, color: "#001F54" },
  label: { fontSize: 16, color: "#001F54" },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    backgroundColor: "#fff",
  },

  weekNames: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    marginTop: 8,
  },
  weekNameText: {
    width: 46,
    textAlign: "center",
    fontWeight: "600",
    color: "#666",
  },

  dayItem: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F0F0F0",
    marginHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  daySelected: { backgroundColor: "#CCCCCC" },
  dayPast: { opacity: 0.4 },
  dayNumber: { fontWeight: "700", fontSize: 16, color: "#222" },
  dayNumberSelected: { color: "#001F54" },

  horarioBox: {
    width: 55,
    height: 55,
    borderRadius: 8,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  horarioHora: { color: "#FFF", fontWeight: "700", fontSize: 13 },
  horarioHoraSelected: { color: "#001F54" },
  horarioStatus: { color: "#FFF", fontSize: 10, marginTop: 2 },
  horarioStatusSelected: { color: "#001F54" },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  confirmButton: {
    backgroundColor: "#001F54",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  confirmText: { color: "#FFF", fontWeight: "700", fontSize: 16 },

  whatsappButton: {
    position: "absolute",
    bottom: 120,
    right: 20,
    backgroundColor: "#25D366",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
});

