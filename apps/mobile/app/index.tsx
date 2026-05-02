import { copy } from "@life/shared";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

const screens = ["Today", "Tasks", "Goals", "Habits", "Calendar", "Balance", "Suggestions", "Settings"];

export default function MobileHome() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f4ead8" }} contentContainerStyle={{ padding: 20, gap: 16 }}>
      <Text style={{ fontSize: 42, color: "#1f261f", fontWeight: "700" }}>LifeInbox</Text>
      <Text style={{ fontSize: 18, color: "#4d5548" }}>Один вход для задач, целей, привычек и мыслей.</Text>
      <View style={{ backgroundColor: "#fffaf0", borderRadius: 28, padding: 18, gap: 12 }}>
        <TextInput multiline placeholder={copy.ru.inboxPlaceholder} style={{ minHeight: 110, fontSize: 16 }} />
        <TouchableOpacity style={{ backgroundColor: "#1f261f", borderRadius: 24, padding: 16 }}>
          <Text style={{ color: "white", fontSize: 16 }}>Разобрать AI</Text>
        </TouchableOpacity>
      </View>
      {screens.map((screen) => (
        <View key={screen} style={{ backgroundColor: "rgba(255,255,255,0.55)", borderRadius: 22, padding: 16 }}>
          <Text style={{ color: "#1f261f", fontSize: 18 }}>{screen}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
