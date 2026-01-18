import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import type { StartupFailure } from "../types";

const startupsCol = collection(db, "startups");

export async function upsertStartup(startup: StartupFailure) {
  const ref = doc(db, "startups", startup.id);
  await setDoc(
    ref,
    {
      ...startup,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function removeStartup(startupId: string) {
  const ref = doc(db, "startups", startupId);
  await deleteDoc(ref);
}

export function subscribeStartups(onChange: (items: StartupFailure[]) => void) {
  const q = query(startupsCol, orderBy("updatedAt", "desc"));
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map((d) => d.data() as StartupFailure));
  });
}
