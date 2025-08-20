import type { CoreMessage } from "~/types/chat";
import { atom } from "jotai";

export const messageHistoryAtom = atom<CoreMessage[]>([]);
export const lastMessageAtom = atom<CoreMessage | null>(null);
export const isLoadingAtom = atom(false);
export const displayedTextAtom = atom<string>('');
