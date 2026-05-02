import { heuristicClassify } from "@life/ai";
import { type AiClassification, type Locale } from "@life/shared";
import { useMemo, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

type MobileRecord = AiClassification["items"][number] & { id: string; inboxId: string; createdAt: string };
type InboxRecord = { id: string; text: string; classification: AiClassification; createdAt: string };

const labels = {
  ru: { today: "Сегодня", tasks: "Задачи", goals: "Цели", habits: "Привычки", calendar: "Календарь", balance: "Баланс", inbox: "Журнал", button: "Разобрать локально", empty: "Пока пусто", placeholder: "Напишите что угодно: задачу, мысль, цель, привычку..." },
  en: { today: "Today", tasks: "Tasks", goals: "Goals", habits: "Habits", calendar: "Calendar", balance: "Balance", inbox: "Inbox", button: "Classify locally", empty: "Empty for now", placeholder: "Write anything: a task, thought, goal, habit..." },
} as const;

const areas = ["health", "career", "relationships", "growth"];

export default function MobileHome() {
  const [locale, setLocale] = useState<Locale>("ru");
  const [text, setText] = useState("");
  const [inbox, setInbox] = useState<InboxRecord[]>([]);
  const [records, setRecords] = useState<MobileRecord[]>([]);
  const l = labels[locale];
  const plan = useMemo(() => records.filter((record) => ["task", "event", "habit"].includes(record.type)).slice(0, 5), [records]);

  function submit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    const classification = heuristicClassify(trimmed, locale);
    const now = new Date().toISOString();
    const inboxId = `inbox_${Date.now()}`;
    setInbox((current) => [{ id: inboxId, text: trimmed, classification, createdAt: now }, ...current]);
    setRecords((current) => [...classification.items.map((item, index) => ({ ...item, id: `${item.type}_${Date.now()}_${index}`, inboxId, createdAt: now })), ...current]);
    setText("");
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f4ead8" }} contentContainerStyle={{ padding: 20, gap: 16 }}>
      <View style={{ alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 42, color: "#1f261f", fontWeight: "700" }}>LifeInbox</Text>
          <Text style={{ fontSize: 18, color: "#4d5548" }}>{locale === "ru" ? "Один вход для задач, целей, привычек и мыслей." : "One inbox for tasks, goals, habits, and thoughts."}</Text>
        </View>
        <TouchableOpacity onPress={() => setLocale(locale === "ru" ? "en" : "ru")} style={{ backgroundColor: "#1f261f", borderRadius: 24, paddingHorizontal: 14, paddingVertical: 10 }}>
          <Text style={{ color: "white" }}>{locale.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ backgroundColor: "#fffaf0", borderRadius: 28, padding: 18, gap: 12 }}>
        <TextInput multiline placeholder={l.placeholder} value={text} onChangeText={setText} style={{ minHeight: 110, fontSize: 16 }} />
        <TouchableOpacity onPress={submit} style={{ backgroundColor: "#1f261f", borderRadius: 24, padding: 16 }}>
          <Text style={{ color: "white", fontSize: 16 }}>{l.button}</Text>
        </TouchableOpacity>
      </View>

      <Section title={l.today} count={plan.length} empty={l.empty}>{plan.map((item) => <RecordRow key={item.id} title={item.title} meta={`${item.type} / ${item.priority}`} />)}</Section>
      <Section title={l.tasks} count={count(records, "task")} empty={l.empty}>{records.filter((item) => item.type === "task").map((item) => <RecordRow key={item.id} title={item.title} meta={item.priority} />)}</Section>
      <Section title={l.goals} count={count(records, "goal")} empty={l.empty}>{records.filter((item) => item.type === "goal").map((item) => <RecordRow key={item.id} title={item.title} meta={item.lifeArea ?? "growth"} />)}</Section>
      <Section title={l.habits} count={count(records, "habit")} empty={l.empty}>{records.filter((item) => item.type === "habit").map((item) => <RecordRow key={item.id} title={item.title} meta={item.recurrence ?? "daily"} />)}</Section>
      <Section title={l.calendar} count={count(records, "event")} empty={l.empty}>{records.filter((item) => item.type === "event").map((item) => <RecordRow key={item.id} title={item.title} meta={item.dueAt ?? "soon"} />)}</Section>

      <View style={{ backgroundColor: "rgba(255,255,255,0.55)", borderRadius: 22, padding: 16, gap: 10 }}>
        <Text style={{ color: "#1f261f", fontSize: 18, fontWeight: "700" }}>{l.balance}</Text>
        {areas.map((area, index) => <RecordRow key={area} title={area} meta={`${6 + (index % 3)}/10`} />)}
      </View>

      <Section title={l.inbox} count={inbox.length} empty={l.empty}>{inbox.map((item) => <RecordRow key={item.id} title={item.text} meta={new Date(item.createdAt).toLocaleDateString(locale)} />)}</Section>
    </ScrollView>
  );
}

function Section({ title, count, empty, children }: { title: string; count: number; empty: string; children: React.ReactNode }) {
  return <View style={{ backgroundColor: "rgba(255,255,255,0.55)", borderRadius: 22, padding: 16, gap: 10 }}><Text style={{ color: "#1f261f", fontSize: 18, fontWeight: "700" }}>{title} · {count}</Text>{count > 0 ? children : <Text style={{ color: "#6e725f" }}>{empty}</Text>}</View>;
}

function RecordRow({ title, meta }: { title: string; meta: string }) {
  return <View style={{ borderTopColor: "rgba(31,38,31,0.12)", borderTopWidth: 1, paddingTop: 8 }}><Text style={{ color: "#1f261f", fontSize: 16 }}>{title}</Text><Text style={{ color: "#6e725f", marginTop: 2 }}>{meta}</Text></View>;
}

function count(records: MobileRecord[], type: MobileRecord["type"]) {
  return records.filter((record) => record.type === type).length;
}
