import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
  Text,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { TextInput } from "react-native-gesture-handler";
import { chatHistoryId as chatHistoryIdAtom } from "@/state/chat";
import { useAtom } from "jotai";
import {
  KeyboardControllerView,
  KeyboardStickyView,
  useReanimatedKeyboardAnimation,
} from "react-native-keyboard-controller";
import Icon from "@expo/vector-icons/FontAwesome6";
import ChatBubble from "./ChatBubble";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePrevious } from "@uidotdev/usehooks";
import { createMessage, Message, useDB } from "@/services/database";
import * as crypto from "expo-crypto";
import Toast from "react-native-toast-message";

interface FormData {
  question?: string;
  article?: { title: string; url: string };
}

const MESSAGE_BAR_HEIGHT = 50;

const BasicForm: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [articleUrl, setArticleUrl] = useState<string>("");
  const [fetching, setFetching] = useState(false);
  const [chatHistoryId] = useAtom(chatHistoryIdAtom);
  const prevChatHistoryId = usePrevious(chatHistoryId);

  const { height } = useReanimatedKeyboardAnimation();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const { control, handleSubmit, setValue } = useForm();
  const { getMessagesByChatIdAsync, getChatHistoryByIdAsync } = useDB();

  useEffect(() => {
    if (chatHistoryId !== prevChatHistoryId) {
      if (chatHistoryId) {
        getMessagesByChatIdAsync(chatHistoryId).then((messages) => {
          setChatHistory(messages.reverse());
        });
        getChatHistoryByIdAsync(chatHistoryId).then((chatHistory) => {
          setArticleUrl(chatHistory?.article_url || "");
        });
      }
    }
  }, [chatHistoryId, prevChatHistoryId]);

  const chatHistoryFlatListRef = useRef<FlatList>(null);

  useEffect(() => {
    setTimeout(() => {
      scrollToEnd();
    }, 100);
  }, [chatHistory]);

  const onSubmit = (data: FormData) => {
    if (!data.question) {
      return;
    }
    if (typeof data.question === "string") {
      if (!chatHistoryId) {
        Toast.show({
          type: "error",
          text1: "Please choose an article or chat history!",
        });
        return;
      }
      const id = crypto.randomUUID();
      setChatHistory((prev) => [
        ...prev,
        { text: data.question || "", sent: true, id, chatId: chatHistoryId },
      ]);

      createMessage(id, chatHistoryId, data.question, true);
    }
    const submitData = {
      article: articleUrl,
      question: data.question,
    };
    setFetching(true);
    setValue("question", "");
    fetch(process.env.EXPO_PUBLIC_API_BASE || "", {
      method: "POST",
      body: JSON.stringify(submitData),
    })
      .then((res) => res.json())
      .then((json) => {
        if (!chatHistoryId) {
          return;
        }
        const id = crypto.randomUUID();
        setChatHistory((prev) => [
          ...prev,
          { text: json.answer || "", sent: false, chatId: chatHistoryId, id },
        ]);
        setFetching(false);

        createMessage(id, chatHistoryId, json.answer, false)
          .then(() => {})
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
        setFetching(false);
      });
  };

  const scrollToEnd = () => {
    chatHistoryFlatListRef.current?.scrollToOffset({
      offset: Infinity,
      animated: true,
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    // keyboard is open
    if (height.value < -1) {
      return {
        height: withTiming(
          // minus 100 for the header height
          windowHeight + height.value - 100 - MESSAGE_BAR_HEIGHT,
          {
            duration: 200,
          }
        ),
      };
    }
    // keyboard is closed
    return {
      height: withTiming(
        // minus 100 for the header height
        windowHeight + height.value - 100 - MESSAGE_BAR_HEIGHT - bottomInset,
        { duration: 200 }
      ),
    };
  });

  return (
    <KeyboardControllerView
      onKeyboardMove={() => {
        chatHistoryFlatListRef.current?.scrollToOffset({
          offset: Infinity,
          animated: false,
        });
      }}
      style={styles.keyboardControllerView}
    >
      {!chatHistoryId ? (
        <View
          style={{ justifyContent: "center", alignItems: "center", flex: 1 }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 24,
              textAlign: "center",
              paddingHorizontal: 10,
            }}
          >
            Tap the lil book icon up there ☝️ to get started
          </Text>
        </View>
      ) : (
        <Animated.View style={[styles.flatListContainer, animatedStyle]}>
          <FlatList
            ref={chatHistoryFlatListRef}
            data={chatHistory}
            renderItem={({ item }: { item: Message }) => (
              <ChatBubble message={item.text} sent={item.sent} />
            )}
            ListFooterComponent={
              fetching ? (
                <ActivityIndicator style={styles.activityIndicator} />
              ) : null
            }
            style={styles.flatList}
          />
        </Animated.View>
      )}
      <KeyboardStickyView
        style={{ height: MESSAGE_BAR_HEIGHT }}
        offset={{ opened: -5, closed: -bottomInset }}
      >
        <View style={styles.inputContainer}>
          <Controller
            control={control}
            name="question"
            defaultValue=""
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={{ flex: 1, color: "white" }}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Ask a question"
                placeholderTextColor={"white"}
                onSubmitEditing={handleSubmit(onSubmit)}
                autoCorrect={true}
              />
            )}
          />
          <TouchableOpacity onPress={handleSubmit(onSubmit)}>
            <Icon name="circle-arrow-up" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardStickyView>
    </KeyboardControllerView>
  );
};

const styles = StyleSheet.create({
  activityIndicator: { margin: 20 },
  answer: { marginVertical: 20 },
  bottomSheetContentContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: "#333",
  },
  button: {
    textAlign: "center",
    padding: 10,
    backgroundColor: "#007BFF",
    color: "#fff",
  },
  flatListContainer: {
    borderWidth: 1,
    paddingBottom: 10,
  },
  flatList: { flex: 1, paddingHorizontal: 10 },
  inputContainer: {
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    color: "white",
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "black",
  },
  keyboardControllerView: {
    flex: 1,
    borderWidth: 1,
    justifyContent: "space-between",
  },
  label: {
    marginBottom: 10,
  },
  picker: {
    marginBottom: 20,
  },
});

export default BasicForm;
