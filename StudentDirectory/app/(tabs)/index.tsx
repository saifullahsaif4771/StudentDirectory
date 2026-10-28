
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import SearchBar from "@/components/search-bar";
import StudentDetail from "@/components/student-detail";
import StudentItem from "@/components/student-item";
import { useStudents } from "@/context/students-context";
import { Student } from "@/data/students";

export default function Index() {
  const { students, dispatch } = useStudents();

  const [query, setQuery] = useState("");
  const [selectedStudent, setSelectedStudent] =
    useState<Student | null>(null);

  const filtered = students.filter(
    (student) =>
      student.name.toLowerCase().includes(query.toLowerCase()) ||
      student.department.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (student: Student) => {
    setSelectedStudent((prev) =>
      prev?.id === student.id ? null : student
    );
  };

  const handleReset = () => {
    Alert.alert(
      "Reset Student Directory",
      "Are you sure you want to restore the original student list? All added students will be removed.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            dispatch({ type: "RESET" });
            setSelectedStudent(null);
            setQuery("");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.titleBar}>
        <Text style={styles.title}>
          Student Directory ({students.length})
        </Text>

        <View style={styles.actions}>
          <Pressable
            style={styles.resetButton}
            onPress={handleReset}
          >
            <Text style={styles.resetButtonText}>Reset</Text>
          </Pressable>

          <Pressable
            style={styles.addButton}
            onPress={() => router.push("/(tabs)/add-student")}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </Pressable>
        </View>
      </View>

      <SearchBar value={query} onChangeText={setQuery} />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <StudentItem
            student={item}
            onPress={handleSelect}
            isSelected={selectedStudent?.id === item.id}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              No students match "{query}"
            </Text>
          </View>
        }
      />

      {selectedStudent && (
        <StudentDetail student={selectedStudent} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F0F4F8",
  },
  titleBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#0D1F4E",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    flexShrink: 1,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  resetButton: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  addButton: {
    backgroundColor: "#0D9488",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  empty: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#94A3B8",
  },
});
