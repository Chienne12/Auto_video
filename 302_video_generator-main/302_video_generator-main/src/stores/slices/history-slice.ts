/* eslint-disable @typescript-eslint/no-explicit-any */
import { produce } from "immer";
import { StateCreator } from "zustand";

export enum HistoryType {
  VIDEO_GENERATION = "VIDEO_GENERATION",
}

// History interface with an additional result property
export interface History {
  id: string;
  timestamp: number;
  type: HistoryType;
  payload: any; // Todo: optim
}

export interface HistoryStore {
  historys: History[];
  addHistory: (payload: unknown, type: HistoryType) => void;
  getHistory: (id: string) => History | undefined;
  deleteHistory: (id: string) => void;
  clearHistorys: () => void;
  clearHistorysByType: (type: HistoryType) => void;
  getHistorysByType: (type: HistoryType) => History[];
}

// Implementation of the createHistorySlice
export const createHistorySlice: StateCreator<
  HistoryStore,
  [],
  [],
  HistoryStore
> = (set, get) => ({
  historys: [],
  addHistory: (payload: unknown, type: HistoryType) => {
    set(
      produce((draft) => {
        const newHistory: History = {
          id: Math.random().toString(36).substr(2, 9),
          payload,
          timestamp: Date.now(),
          type,
        };
        draft.historys.push(newHistory);
      })
    );
  },
  getHistory: (id: string) => {
    return get().historys.find((history) => history.id === id);
  },
  deleteHistory: (id: string) => {
    set(
      produce((draft) => {
        draft.historys = draft.historys.filter(
          (history: { id: string }) => history.id !== id
        );
      })
    );
  },
  clearHistorys: () => {
    set(
      produce((draft) => {
        draft.historys = [];
      })
    );
  },
  clearHistorysByType: (type: HistoryType) => {
    set(
      produce((draft) => {
        draft.historys = draft.historys.filter(
          (history: { type: HistoryType }) => history.type !== type
        );
      })
    );
  },
  getHistorysByType: (type: HistoryType) => {
    return get().historys.filter((history) => history.type === type);
  },
});
