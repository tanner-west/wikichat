import React, { useEffect, useState } from "react";
import ChatScreen from "@/components/chat/ChatScreen";
import { initDatabase } from "@/services/database";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import * as SQLite from "expo-sqlite";

const DrizzleContainer = ({ db }: { db: SQLite.SQLiteDatabase }) => {
  useDrizzleStudio(db);
  return null;
};

const Home = () => {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  useEffect(() => {
    const init = async () => {
      try {
        const db = await SQLite.openDatabaseAsync("chat.db");
        setDb(db);
        await initDatabase(db);
      } catch (error) {
        console.error(error);
      }
    };
    init();
  }, []);

  return (
    <>
      {db && <DrizzleContainer db={db} />}
      <ChatScreen />
    </>
  );
};

export default Home;
