import { useWikipediaSearch } from "@/hooks/useWikipediaSearch";
import { chatHistoryId as chatHistoryIdAtom } from "@/state/chat";
import { useAtom } from "jotai";
import { useState } from "react";
import {
  FlatList,
  TextInput,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { createChatHistory } from "@/services/database";
import * as crypto from "expo-crypto";

export default function Search() {
  const { search, searchResults } = useWikipediaSearch();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [chatHistoryId, setChatHistoryId] = useAtom(chatHistoryIdAtom);

  return (
    <View>
      <TextInput
        placeholder="Search Wikipedia"
        placeholderTextColor={"white"}
        value={searchTerm}
        onChangeText={(val) => {
          search(val);
          setSearchTerm(val);
        }}
        style={{
          padding: 10,
          borderColor: "white",
          borderWidth: 1,
          color: "white",
          borderRadius: 20,
          margin: 10,
        }}
      />
      <FlatList
        data={searchResults}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              const id = crypto.randomUUID();
              createChatHistory(id, item.title, item.url);
              setChatHistoryId(id);
            }}
          >
            <Text
              style={{
                color: "white",
                paddingHorizontal: 10,
                marginVertical: 10,
                fontSize: 16,
              }}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
