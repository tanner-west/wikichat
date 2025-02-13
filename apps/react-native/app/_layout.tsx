import { useEffect, useRef, useState } from "react";
import { TouchableOpacity } from "react-native";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import "react-native-reanimated";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { Drawer } from "expo-router/drawer";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useAtom } from "jotai";
import Icon from "@expo/vector-icons/FontAwesome6";
import usePrevious from "@/hooks/usePrevious";
import { useColorScheme } from "@/hooks/useColorScheme";
import Search from "@/components/wikipedia/Search";
import DrawerContent from "@/components/drawer/DrawerContent";
import { chatHistoryId as chatHistoryIdAtom } from "@/state/chat";
import { useDB } from "@/services/database";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import Toast from 'react-native-toast-message';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
function ToastContainer(){
  const {top} = useSafeAreaInsets();
  return <Toast topOffset={top}/>
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [articleTitle, setArticleTitle] = useState<string>("");
  const [chatHistoryId] = useAtom(chatHistoryIdAtom);
  const prevChatHistoryId = usePrevious(chatHistoryId);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const { getChatHistoryByIdAsync } = useDB();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    if (prevChatHistoryId !== chatHistoryId && chatHistoryId) {
      bottomSheetModalRef.current?.dismiss();
      if (chatHistoryId) {
        getChatHistoryByIdAsync(chatHistoryId).then((chatHistory) => {
          setArticleTitle(chatHistory?.article_title || "");
        });
      }
    }
  }, [chatHistoryId, prevChatHistoryId]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <SafeAreaProvider>
            <KeyboardProvider>
              <Drawer
                drawerContent={({
                  navigation,
                }: DrawerContentComponentProps) => (
                  <DrawerContent navigation={navigation} />
                )}
              >
                <Drawer.Screen
                  name="index"
                  options={{
                    headerTitle: articleTitle,
                    headerStyle: { height: 100 },
                    headerRight: () => (
                      <TouchableOpacity
                        onPress={() => bottomSheetModalRef.current?.present()}
                        style={{ marginRight: 10 }}
                      >
                        <Icon name="book" size={24} color="white" />
                      </TouchableOpacity>
                    ),
                  }}
                />
                <Drawer.Screen name="+not-found" />
              </Drawer>
              <BottomSheetModal
                ref={bottomSheetModalRef}
                snapPoints={["80%"]}
                index={1}
                style={{ backgroundColor: "#111" }}
              >
                <BottomSheetView style={{ backgroundColor: "#111", flex: 1 }}>
                  <Search />
                </BottomSheetView>
              </BottomSheetModal>
              <StatusBar style="auto" />
              <ToastContainer/>
            </KeyboardProvider>
          </SafeAreaProvider>
        </ThemeProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
