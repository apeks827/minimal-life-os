import { Text, View } from "react-native";

export default function Settings() {
  return <View style={{ flex: 1, backgroundColor: "#f4ead8", padding: 24, gap: 12 }}><Text style={{ fontSize: 34, fontWeight: "700", color: "#1f261f" }}>Advanced Settings</Text><Text>Language, AI tone, suggestion level, privacy, export, and test mode are web-backed concepts; mobile remains local-first for MVP.</Text></View>;
}
