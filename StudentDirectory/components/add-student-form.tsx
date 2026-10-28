
// components/add-student-form.tsx

import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import { router } from "expo-router";

import FormField from "./form-field";
import { Student } from "../data/students";
import { useStudents } from "../context/students-context";

interface FormData {
  name: string;
  studentId: string;
  department: string;
  bio: string;
  skillsText: string;
}

interface FormErrors {
  name?: string;
  studentId?: string;
  department?: string;
  bio?: string;
}

// Validate the form fields
function validateForm(data: FormData): FormErrors {
  const newErrors: FormErrors = {};

  if (data.name.trim().length === 0) {
    newErrors.name = "Name is required.";
  } else if (data.name.trim().length < 3) {
    newErrors.name = "Name must be at least 3 characters.";
  }

  const idPattern = /^\d{2}-\d{5}-\d$/;

  if (data.studentId.trim().length === 0) {
    newErrors.studentId = "Student ID is required.";
  } else if (!idPattern.test(data.studentId.trim())) {
    newErrors.studentId =
      "Format must be NN-NNNNN-N (e.g. 22-12345-1).";
  }

  if (data.department.trim().length === 0) {
    newErrors.department = "Department is required.";
  }

  if (data.bio.trim().length === 0) {
    newErrors.bio = "Bio is required.";
  } else if (data.bio.trim().length < 10) {
    newErrors.bio = "Bio must be at least 10 characters.";
  }

  return newErrors;
}

export default function AddStudentForm() {
  // Read the shared student list and dispatch function
  const { students, dispatch } = useStudents();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    studentId: "",
    department: "",
    bio: "",
    skillsText: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitTrigger, setSubmitTrigger] = useState(false);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const markTouched = (field: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const getFieldError = (field: keyof FormErrors) => {
    return touched[field] || submitAttempted
      ? errors[field]
      : undefined;
  };

  // Validate fields and check for duplicate student IDs
  useEffect(() => {
    const newErrors = validateForm(formData);
    const enteredId = formData.studentId.trim();

    if (
      enteredId.length > 0 &&
      students.some(
        (student) => student.studentId.trim() === enteredId
      )
    ) {
      newErrors.studentId = "Student ID already exists";
    }

    setErrors(newErrors);
  }, [formData, students]);

  const isFormValid =
    Object.keys(errors).length === 0 &&
    formData.name.trim().length > 0 &&
    formData.studentId.trim().length > 0 &&
    formData.department.trim().length > 0 &&
    formData.bio.trim().length > 0;

  const handleSubmitPress = () => {
    setSubmitAttempted(true);

    setTouched((prev) => ({
      ...prev,
      name: true,
      studentId: true,
      department: true,
      bio: true,
      skillsText: true,
    }));

    // Validate immediately before submitting
    const newErrors = validateForm(formData);
    const enteredId = formData.studentId.trim();

    // Feature 3: Prevent duplicate Student IDs
    const duplicateExists = students.some(
      (student) => student.studentId.trim() === enteredId
    );

    if (duplicateExists && enteredId.length > 0) {
      newErrors.studentId = "Student ID already exists";
    }

    setErrors(newErrors);

    // Stop if validation fails or the ID already exists
    if (Object.keys(newErrors).length > 0 || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitTrigger(true);
  };

  // Simulate an asynchronous submission
  useEffect(() => {
    if (!submitTrigger) return;

    const timeoutId = setTimeout(() => {
      const newStudent: Student = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        studentId: formData.studentId.trim(),
        department: formData.department.trim(),
        bio: formData.bio.trim(),
        skills: formData.skillsText
          .split(",")
          .map((skill) => skill.trim())
          .filter((skill) => skill.length > 0),
        avatarUrl: "https://i.pravatar.cc/150?u=" + Date.now(),
      };

      // Final duplicate check before adding
      const duplicateExists = students.some(
        (student) =>
          student.studentId.trim() === newStudent.studentId
      );

      if (duplicateExists) {
        setErrors((prev) => ({
          ...prev,
          studentId: "Student ID already exists",
        }));
        setTouched((prev) => ({ ...prev, studentId: true }));
        setSubmitAttempted(true);
        setIsSubmitting(false);
        setSubmitTrigger(false);
        return;
      }

      // Add the student to the shared context
      dispatch({
        type: "ADD_STUDENT",
        payload: newStudent,
      });

      setIsSubmitting(false);
      setSubmitTrigger(false);

      // Return to the directory
      router.back();
    }, 1500);

    // Clean up the timeout if the component unmounts
    return () => {
      clearTimeout(timeoutId);
    };
  }, [submitTrigger]);

  return (
    <ScrollView
      style={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.heading}>Join the Directory</Text>

      <Text style={styles.subheading}>
        Fill in your details below to add yourself to StudentDirectory.
      </Text>

      <FormField
        label="Full Name"
        value={formData.name}
        onChangeText={(text) => updateField("name", text)}
        onBlur={() => markTouched("name")}
        placeholder="e.g. Ashraful Haque"
        error={getFieldError("name")}
      />

      <FormField
        label="Student ID"
        value={formData.studentId}
        onChangeText={(text) => updateField("studentId", text)}
        onBlur={() => markTouched("studentId")}
        placeholder="e.g. 22-12345-1"
        autoCapitalize="none"
        error={getFieldError("studentId")}
      />

      <FormField
        label="Department"
        value={formData.department}
        onChangeText={(text) => updateField("department", text)}
        onBlur={() => markTouched("department")}
        placeholder="e.g. Computer Science"
        error={getFieldError("department")}
      />

      <FormField
        label="Bio"
        value={formData.bio}
        onChangeText={(text) => updateField("bio", text)}
        onBlur={() => markTouched("bio")}
        placeholder="A short sentence about yourself..."
        multiline
        error={getFieldError("bio")}
      />

      <FormField
        label="Skills (comma-separated)"
        value={formData.skillsText}
        onChangeText={(text) => updateField("skillsText", text)}
        onBlur={() => markTouched("skillsText")}
        placeholder="e.g. React Native, TypeScript, Figma"
        autoCapitalize="none"
      />

      <Pressable
        style={[
          styles.button,
          (!isFormValid || isSubmitting) && styles.buttonDisabled,
        ]}
        onPress={handleSubmitPress}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Join Directory</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0D1F4E",
    marginBottom: 4,
  },
  subheading: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 24,
    lineHeight: 19,
  },
  button: {
    backgroundColor: "#0D9488",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 32,
  },
  buttonDisabled: {
    backgroundColor: "#CBD5E1",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
