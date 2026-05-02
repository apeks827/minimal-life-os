import { Tabs } from "expo-router";

export default function Layout() {
  return (
    <Tabs screenOptions={{ headerStyle: { backgroundColor: "#f4ead8" }, headerTintColor: "#1f261f", tabBarActiveTintColor: "#1f261f", tabBarStyle: { backgroundColor: "#fffaf0" } }}>
      <Tabs.Screen name="index" options={{ title: "Inbox" }} />
      <Tabs.Screen name="today" options={{ title: "Today" }} />
      <Tabs.Screen name="balance" options={{ title: "Balance" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
