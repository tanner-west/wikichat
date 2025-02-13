import { ChatHistory, useDB } from "@/services/database";
import { useAtom } from "jotai";
import React, { FC, useEffect } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  Button,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  chatHistoryId as chatHistoryIdAtom,
} from "@/state/chat";
import { DrawerNavigationHelpers } from "@react-navigation/drawer/lib/typescript/commonjs/src/types";
import { useDrawerStatus } from "@react-navigation/drawer";

interface Props {
  navigation: DrawerNavigationHelpers;
}
const DrawerContent: FC<Props> = ({ navigation }) => {
  const { chatHistory, nukeAsync, refreshHistory, getMessagesByChatIdAsync } =
    useDB();
  const [_, setChatHistoryId] = useAtom(chatHistoryIdAtom);
  const drawerStatus = useDrawerStatus()
  const { top, bottom } = useSafeAreaInsets();

  useEffect(() => {
    if(drawerStatus === 'open'){
        refreshHistory()
    }
  },[drawerStatus])

  const onPressChatHistory = async (id: string) => {
    setChatHistoryId(id);
    navigation.closeDrawer();
  };
  const renderItem = ({ item }: { item: ChatHistory }) => {
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => onPressChatHistory(item.id)}
      >
        <Text style={styles.title}>{item.article_title}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ paddingTop: top, paddingBottom: bottom, flex: 1 }}>
      <FlatList
        data={chatHistory}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
      <View>
        <Button title="Nuke DB" onPress={nukeAsync} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    padding: 10,
  },
  title: {
    fontSize: 18,
    color: "white",
  },
});

export default DrawerContent;
