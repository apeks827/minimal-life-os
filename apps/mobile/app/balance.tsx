import { lifeAreaLabels } from "@life/shared";
import { ScrollView, Text, View } from "react-native";

export default function Balance() {
  return <ScrollView style={{ flex: 1, backgroundColor: "#f4ead8" }} contentContainerStyle={{ padding: 24, gap: 12 }}><Text style={{ fontSize: 34, fontWeight: "700", color: "#1f261f" }}>Balance</Text>{Object.values(lifeAreaLabels).map((label, index) => <View key={label.en} style={{ backgroundColor: "#fffaf0", borderRadius: 20, padding: 14 }}><Text>{label.en} / {label.ru}: {6 + (index % 3)}/10</Text></View>)}</ScrollView>;
}
