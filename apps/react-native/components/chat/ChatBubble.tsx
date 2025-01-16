import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface ChatBubbleProps {
  message: string;
  sent?: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, sent }) => {
  return (
    <View style={[styles.bubble, sent ? styles.sent : styles.received]}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    padding: 15,
    borderRadius: 30,
    marginVertical: 5,
    maxWidth: "80%",
  },
  sent: {
    backgroundColor: "#2E294E",
    alignSelf: "flex-end",
  },
  received: {
    backgroundColor: "black",
    alignSelf: "flex-start",
  },
  message: {
    fontSize: 16,
    color: "white",
  },
});

export default ChatBubble;
