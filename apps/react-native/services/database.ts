import * as SQLite from "expo-sqlite";
import { useState } from "react";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

export interface Message {
  id: string;
  chatId: string;
  text: string;
  sent: boolean;
}

export interface ChatHistory {
  id: string;
  article_title: string;
  article_url: string;
}

// Initialize database tables
export const initDatabase = async (db: SQLite.SQLiteDatabase) => {
  // Create messages table
  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      chatId TEXT NOT NULL,
      text TEXT NOT NULL,
      sent BOOLEAN NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,r
      modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

    )`
  );

  await db.execAsync(
    `CREATE TRIGGER IF NOT EXISTS messages_modified_at
     AFTER UPDATE ON messages
     BEGIN
        UPDATE messages SET modified_at = CURRENT_TIMESTAMP
        WHERE id = NEW.id;
     END`
  );

  // Create chat history table
  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS chat_history (
      id TEXT PRIMARY KEY,
      article_title TEXT NOT NULL,
      article_url TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  );
  // Create trigger for chat_history modified_at
  await db.execAsync(
    `CREATE TRIGGER IF NOT EXISTS chat_history_modified_at
       AFTER UPDATE ON chat_history
       BEGIN
          UPDATE chat_history SET modified_at = CURRENT_TIMESTAMP
          WHERE id = NEW.id;
       END`
  );
};

// Messages CRUD operations
export const createMessage = async (
  id: string,
  chatId: string,
  text: string,
  sent: boolean
) => {
  const db = await SQLite.openDatabaseAsync("chat.db");
  await db.runAsync(
    `INSERT INTO messages (id, chatId, text, sent) VALUES (?, ?, ?, ?)`,
    [id, chatId, text, sent]
  );
};

export const getMessage = async (id: string) => {
  const db = await SQLite.openDatabaseAsync("chat.db");
  return await db.getFirstAsync<Message>(
    `SELECT * FROM messages WHERE id = ?`,
    [id]
  );
};

export const getAllMessages = async () => {
  const db = await SQLite.openDatabaseAsync("chat.db");
  return await db.getAllAsync<Message>(
    `SELECT * FROM messages ORDER BY created_at DESC`
  );
};

export const getMessagesByChatId = async (chatId: string) => {
  const db = await SQLite.openDatabaseAsync("chat.db");
  return await db.getAllAsync<Message>(
    `SELECT * FROM messages WHERE chatId = ? ORDER BY created_at DESC`,
    [chatId]
  );
};
export const updateMessage = async (id: string, text: string) => {
  const db = await SQLite.openDatabaseAsync("chat.db");
  await db.runAsync(`UPDATE messages SET text = ? WHERE id = ?`, [text, id]);
};

export const deleteMessage = async (id: string) => {
  const db = await SQLite.openDatabaseAsync("chat.db");
  await db.runAsync(`DELETE FROM messages WHERE id = ?`, [id]);
};

// Chat History CRUD operations
export const createChatHistory = async (
  id: string,
  articleTitle: string,
  articleUrl: string
) => {
  const db = await SQLite.openDatabaseAsync("chat.db");
  await db.runAsync(
    `INSERT INTO chat_history (id, article_title, article_url) VALUES (?, ?, ?)`,
    [id, articleTitle, articleUrl]
  );
};

export const getChatHistory = async (id: string) => {
  const db = await SQLite.openDatabaseAsync("chat.db");
  return await db.getFirstAsync<ChatHistory>(
    `SELECT * FROM chat_history WHERE id = ?`,
    [id]
  );
};

export const getAllChatHistory = async () => {
  const db = await SQLite.openDatabaseAsync("chat.db");
  return await db.getAllAsync<ChatHistory>(
    `SELECT * FROM chat_history ORDER BY created_at DESC`
  );
};

export const updateChatHistory = async (
  id: string,
  articleTitle: string,
  articleUrl: string
) => {
  const db = await SQLite.openDatabaseAsync("chat.db");
  await db.runAsync(
    `UPDATE chat_history SET article_title = ?, article_url = ? WHERE id = ?`,
    [articleTitle, articleUrl, id]
  );
};

export const deleteChatHistory = async (id: string) => {
  const db = await SQLite.openDatabaseAsync("chat.db");
  await db.runAsync(`DELETE FROM chat_history WHERE id = ?`, [id]);
};

export const resetDatabase = async () => {
  const db = await SQLite.openDatabaseAsync("chat.db");

  // Drop tables if they exist
  await db.execAsync(`DROP TABLE IF EXISTS messages`);
  await db.execAsync(`DROP TABLE IF EXISTS chat_history`);

  // Recreate tables
  await initDatabase(db);
};

export const useDB = () => {
  const [initializingHistory, setInitializingHistory] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatHistory[] | undefined>();

  const nukeAsync = async () => {
    await resetDatabase();
    setChatHistory(undefined);
  };

  const init = async () => {
    const history = await getAllChatHistory();
    setChatHistory(history);
    setInitializingHistory(false);
  };

  const refreshHistory = async () => {
    const history = await getAllChatHistory();
    setChatHistory(history);
    setInitializingHistory(false);
  };

  const getMessagesByChatIdAsync = async (chatId: string) => {
    return await getMessagesByChatId(chatId);
  };

  const getChatHistoryByIdAsync = async (id: string) => {
    return await getChatHistory(id);
  };

  if (!chatHistory) {
    init();
  }

  return {
    chatHistory,
    initializingHistory,
    refreshHistory,
    nukeAsync,
    getMessagesByChatIdAsync,
    getChatHistoryByIdAsync,
  };
};
