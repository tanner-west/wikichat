import { useEffect, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
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
import { article } from "@/state/chat";
import Search from "@/components/wikipedia/Search";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [selectedArticle] = useAtom(article);
  const prevSelectedArticle = usePrevious(selectedArticle);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    if (prevSelectedArticle !== selectedArticle && selectedArticle) {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [selectedArticle]);

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
                drawerContent={() => (
                  <View style={{ marginTop: topInset }}>
                    <FlatList
                      data={Array.from({ length: 10 }).map((_, i) => ({
                        key: i.toString(),
                      }))}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          onPress={() => bottomSheetModalRef.current?.present()}
                        >
                          <Text style={{ color: "white" }}>{item.key}</Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                )}
              >
                <Drawer.Screen
                  name="index"
                  options={{
                    headerTitle: selectedArticle.title,
                    headerStyle: { height: 100 },
                    headerRight: () => (
                      <TouchableOpacity
                        onPress={() => bottomSheetModalRef.current?.present()}
                        style={{ marginRight: 10 }}
                      >
                        <Icon name="book" size={24} color="white" />
                      </TouchableOpacity>
                    ),
                    // TODO: implement the drawer
                    headerLeft: () => null,
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
            </KeyboardProvider>
          </SafeAreaProvider>
        </ThemeProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}