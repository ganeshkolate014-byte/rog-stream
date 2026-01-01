import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { HistoryItem, AnimeDetail, Episode } from "../types";

// NOTE: If you are seeing "Network request failed", ensure these keys are valid for your project.
// If you don't have a project, use the "Demo Login" feature in the app.
const firebaseConfig = {
  apiKey: "AIzaSyAlLxzjm8hP4xBlmUj1Cbl66-JTSigLyy8",
  authDomain: "vvvv-89f82.firebaseapp.com",
  projectId: "vvvv-89f82",
  storageBucket: "vvvv-89f82.firebasestorage.app",
  messagingSenderId: "212566230567",
  appId: "1:212566230567:web:559be7fa0f4b0ed5273002",
  measurementId: "G-5FRQQRQQZ2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export const DEMO_USER_ID = 'demo-otaku-id';

// Helper to check if we should use mock storage (For Demo User)
const isMock = (userId: string) => userId === DEMO_USER_ID;

// Mock Storage Helpers
const getMockData = <T>(key: string, defaultVal: T): T => {
    const data = localStorage.getItem(`mock_cloud_${key}`);
    return data ? JSON.parse(data) : defaultVal;
};

const setMockData = (key: string, data: any) => {
    localStorage.setItem(`mock_cloud_${key}`, JSON.stringify(data));
};

// Database Helpers

export const getUserHistory = async (userId: string): Promise<HistoryItem[]> => {
  // Demo Fallback
  if (isMock(userId)) {
      return getMockData<HistoryItem[]>('history', []);
  }

  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().watchHistory || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching history:", error);
    throw new Error("Could not connect to the user database. Your progress and history won't be loaded.");
  }
};

export const getUserProgress = async (userId: string): Promise<Record<string, UserProgress>> => {
  // Demo Fallback
  if (isMock(userId)) {
      return getMockData<Record<string, UserProgress>>('progress', {});
  }

  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().progress || {};
    }
    return {};
  } catch (error) {
    console.error("Error fetching progress:", error);
    throw new Error("Could not connect to the user database. Your progress and history won't be loaded.");
  }
};

export const saveUserHistory = async (userId: string, newItem: HistoryItem) => {
  // Demo Fallback
  if (isMock(userId)) {
      let currentHistory = getMockData<HistoryItem[]>('history', []);
      currentHistory = currentHistory.filter(h => h.animeId !== newItem.animeId);
      currentHistory.unshift(newItem);
      if (currentHistory.length > 50) currentHistory.pop();
      setMockData('history', currentHistory);
      return;
  }

  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    
    let currentHistory: HistoryItem[] = [];
    if (docSnap.exists()) {
      currentHistory = docSnap.data().watchHistory || [];
    }

    // Remove existing entry for this anime to push to top
    currentHistory = currentHistory.filter(h => h.animeId !== newItem.animeId);
    
    // Add new entry to start
    currentHistory.unshift(newItem);
    
    // Keep limit (e.g., 50 items for cloud storage)
    if (currentHistory.length > 50) currentHistory.pop();

    await setDoc(docRef, { watchHistory: currentHistory }, { merge: true });
  } catch (error) {
    console.error("Error saving history:", error);
    throw new Error("Could not save history. The database is currently offline.");
  }
};

export const removeUserHistoryItem = async (userId: string, animeId: string) => {
  // Demo Fallback
  if (isMock(userId)) {
      let currentHistory = getMockData<HistoryItem[]>('history', []);
      const updatedHistory = currentHistory.filter(h => h.animeId !== animeId);
      setMockData('history', updatedHistory);
      return updatedHistory;
  }

  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const currentHistory = docSnap.data().watchHistory || [];
      const updatedHistory = currentHistory.filter((h: any) => h.animeId !== animeId);
      
      await updateDoc(docRef, { watchHistory: updatedHistory });
      return updatedHistory;
    }
    return [];
  } catch (error) {
    console.error("Error removing history item:", error);
    throw new Error("Could not remove history item. The database is currently offline.");
  }
};

export interface UserProgress {
  animeId: string;
  title: string;
  poster: string;
  currentEpisode: number;
  totalEpisodes: number;
  status: 'Watching' | 'Completed' | 'On Hold';
  lastUpdated: number;
  nextEpisodeId?: string;
}

export const saveAnimeProgress = async (
  userId: string, 
  animeData: AnimeDetail, 
  currentEp: Episode
) => {
  const currentEpIndex = animeData.episodes.findIndex(e => e.id === currentEp.id);
  const nextEp = animeData.episodes[currentEpIndex + 1];
  
  const progressData: UserProgress = {
      animeId: animeData.id,
      title: animeData.title,
      poster: animeData.poster || animeData.image,
      currentEpisode: currentEp.number,
      totalEpisodes: animeData.totalEpisodes || animeData.episodes.length || 0,
      status: 'Watching',
      lastUpdated: Date.now(),
      nextEpisodeId: nextEp ? nextEp.id : undefined
  };

  if (progressData.totalEpisodes > 0 && progressData.currentEpisode >= progressData.totalEpisodes) {
      progressData.status = 'Completed';
  }

  // Demo Fallback
  if (isMock(userId)) {
      const currentProgress = getMockData<Record<string, UserProgress>>('progress', {});
      currentProgress[animeData.id] = progressData;
      setMockData('progress', currentProgress);
      return;
  }

  try {
    const docRef = doc(db, "users", userId);
    // FIX: Read existing progress, update it in memory, and save it back.
    // This prevents the incorrect field name issue ("progress.anime-id") and ensures
    // the data is stored as a proper map field named "progress".
    const docSnap = await getDoc(docRef);
    const existingProgress = docSnap.exists() ? docSnap.data().progress || {} : {};
    
    const updatedProgress = {
        ...existingProgress,
        [animeData.id]: progressData
    };

    await setDoc(docRef, { progress: updatedProgress }, { merge: true });
  } catch (error) {
    console.error("Error saving progress:", error);
    throw new Error("Could not save progress. The database is currently offline.");
  }
};