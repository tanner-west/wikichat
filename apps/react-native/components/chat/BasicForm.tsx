import React, { useState } from "react";
import { View, StyleSheet, TextInput, ActivityIndicator } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useForm, Controller } from "react-hook-form";
import { ThemedText } from "@/components/ThemedText";

interface FormData {
  question?: string;
  article?: string;
}
const BasicForm: React.FC = () => {
  const [fetching, setFetching] = useState(false);
  const [answer, setAnswer] = useState("");
  const { control, handleSubmit } = useForm();

  const onSubmit = (data: FormData) => {
    if (!data.article || !data.question) {
      console.error("Please fill in all fields");
      return;
    }
    setFetching(true);
    fetch("http://localhost:3100/api", {
      method: "POST",
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((json) => {
        setAnswer(json.answer);
        setFetching(false);
      })
      .catch((err) => {
        console.error(err);
        setFetching(false);
      });
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>Question</ThemedText>
      <Controller
        control={control}
        name="question"
        defaultValue=""
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder="Question"
          />
        )}
      />

      <ThemedText style={styles.label}>Article</ThemedText>
      <Controller
        control={control}
        name="article"
        defaultValue=""
        render={({ field: { onChange, value } }) => (
          <Picker
            selectedValue={value}
            onValueChange={onChange}
            style={styles.picker}
          >
            <Picker.Item label="" value={null} />
            <Picker.Item
              label="The Brothers Karamazov"
              value="https://en.wikipedia.org/wiki/The_Brothers_Karamazov"
            />
            <Picker.Item
              label="The Three-Body Problem (novel)"
              value="https://en.wikipedia.org/wiki/The_Three-Body_Problem_(novel)"
            />
            <Picker.Item
              label="Harry Potter (film series)"
              value="https://en.wikipedia.org/wiki/Harry_Potter_(film_series)"
            />
            <Picker.Item
              label="Quasi-War"
              value="https://en.wikipedia.org/wiki/Quasi-War"
            />
          </Picker>
        )}
      />

      <ThemedText style={styles.button} onPress={handleSubmit(onSubmit)}>
        Submit
      </ThemedText>
      {fetching && <ActivityIndicator style={styles.activityIndicator} />}
      {answer && <ThemedText style={styles.answer}>{answer}</ThemedText>}
    </View>
  );
};

const styles = StyleSheet.create({
  activityIndicator: { margin: 20 },
  answer: { marginTop: 20 },
  container: {
    padding: 20,
  },
  label: {
    marginBottom: 10,
  },
  input: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    color: "white",
  },
  picker: {
    marginBottom: 20,
  },
  button: {
    textAlign: "center",
    padding: 10,
    backgroundColor: "#007BFF",
    color: "#fff",
  },
});

export default BasicForm;
