import React, { useEffect, useState } from "react";
import { View, StyleSheet, TextInput, ActivityIndicator } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useForm, Controller, set } from "react-hook-form";
import { ThemedText } from "@/components/ThemedText";
import { queryWikipedia } from "@/services/queries";
import { useDebounce } from "@uidotdev/usehooks";

interface FormData {
  question?: string;
  article?: string;
}
const BasicForm: React.FC = () => {
  const [fetching, setFetching] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [answer, setAnswer] = useState("");
  const [searchresults, setSearchResults] = useState<any>({
    titles: [],
    urls: [],
  });
  const { control, handleSubmit } = useForm();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    console.log(debouncedSearchTerm);
    const encodedSearchTerm = encodeURIComponent(debouncedSearchTerm);
    queryWikipedia(encodedSearchTerm).then((results) => {
      setSearchResults(results);
    });
  }, [debouncedSearchTerm]);

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
    <View>
      {fetching && <ActivityIndicator style={styles.activityIndicator} />}
      {answer && <ThemedText style={styles.answer}>{answer}</ThemedText>}
      <ThemedText style={styles.label} type="subtitle">
        Article
      </ThemedText>
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
            {searchresults?.titles &&
              searchresults?.titles.map((title: any, i: number) => (
                <Picker.Item
                  key={i}
                  label={title}
                  value={searchresults.urls[i]}
                />
              ))}
          </Picker>
        )}
      />
      <ThemedText style={styles.label} type="subtitle">
        Question
      </ThemedText>
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
      <ThemedText style={styles.label} type="subtitle">
        Search Wikipedia
      </ThemedText>
      <Controller
        control={control}
        name="article_search"
        defaultValue=""
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            onChangeText={(v) => setSearchTerm(v)}
            placeholder="Search"
            autoCorrect={true}
          />
        )}
      />
      <ThemedText style={styles.button} onPress={handleSubmit(onSubmit)}>
        Submit
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  activityIndicator: { margin: 20 },
  answer: { marginVertical: 20 },
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
