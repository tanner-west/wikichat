import { Message } from "@/services/database";
import { atom } from "jotai";

export const chatHistoryId = atom<string | undefined>(undefined);
