import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { TextInput } from "react-native-gesture-handler";
import { article } from "@/state/chat";
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

interface IChatMessage {
  message: string;
  sent?: boolean;
}

interface FormData {
  question?: string;
  article?: { title: string; url: string };
}

const MESSAGE_BAR_HEIGHT = 50;

const BasicForm: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<IChatMessage[]>([]);
  const [fetching, setFetching] = useState(false);
  const [selectedArticle] = useAtom(article);

  const { height } = useReanimatedKeyboardAnimation();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const prevSelectedArticle = usePrevious(selectedArticle);

  const { control, handleSubmit, setValue } = useForm();

  useEffect(() => {
    if (prevSelectedArticle !== selectedArticle && selectedArticle) {
      setChatHistory([]);
    }
  }, [selectedArticle]);

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
      setChatHistory((prev) => [
        ...prev,
        { message: data.question || "", sent: true },
      ]);
    }
    const submitData = {
      article: selectedArticle.url,
      question: data.question,
    };
    setFetching(true);
    setValue("question", "");
    fetch("http://localhost:3100/api", {
      method: "POST",
      body: JSON.stringify(submitData),
    })
      .then((res) => res.json())
      .then((json) => {
        setChatHistory((prev) => [
          ...prev,
          { message: json.answer || "", sent: false },
        ]);
        setFetching(false);
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
      <Animated.View style={[styles.flatListContainer, animatedStyle]}>
        <FlatList
          ref={chatHistoryFlatListRef}
          data={chatHistory}
          renderItem={({ item }) => (
            <ChatBubble message={item.message} sent={item.sent} />
          )}
          ListFooterComponent={
            fetching ? (
              <ActivityIndicator style={styles.activityIndicator} />
            ) : null
          }
          style={styles.flatList}
        />
      </Animated.View>
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
