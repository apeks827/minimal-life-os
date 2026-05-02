import { Text, View } from "react-native";

export default function Today() {
  return <View style={{ flex: 1, backgroundColor: "#f4ead8", padding: 24, gap: 12 }}><Text style={{ fontSize: 34, fontWeight: "700", color: "#1f261f" }}>Today Plan</Text><Text>Local-first daily plan, tasks, habits, and events mirror the inbox screen.</Text></View>;
}
