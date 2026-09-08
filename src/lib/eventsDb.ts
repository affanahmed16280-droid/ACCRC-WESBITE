import { db } from './firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';

export interface Event {
  id?: string;
  tag: string;
  title: string;
  venue: string;
  date: Date | Timestamp;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  description?: string;
  registrationLink?: string;
  published: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface News {
  id?: string;
  date: string;
  category: string;
  title: string;
  description: string;
  content?: string;
  published: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export async function addEvent(event: Event) {
  try {
    const docRef = await addDoc(collection(db, 'events'), {
      ...event,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return { id: docRef.id, ...event };
  } catch (error) {
    console.error('Error adding event:', error);
    throw error;
  }
}

export async function updateEvent(id: string, event: Partial<Event>) {
  try {
    const eventRef = doc(db, 'events', id);
    await updateDoc(eventRef, {
      ...event,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
}

export async function deleteEvent(id: string) {
  try {
    await deleteDoc(doc(db, 'events', id));
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
}

export async function getPublishedEvents() {
  try {
    const q = query(
      collection(db, 'events'),
      where('published', '==', true),
      where('status', '==', 'PUBLISHED')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Event[];
  } catch (error) {
    console.error('Error fetching published events:', error);
    return [];
  }
}

export async function getAllEvents() {
  try {
    const querySnapshot = await getDocs(collection(db, 'events'));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Event[];
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

export async function addNews(news: News) {
  try {
    const docRef = await addDoc(collection(db, 'news'), {
      ...news,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return { id: docRef.id, ...news };
  } catch (error) {
    console.error('Error adding news:', error);
    throw error;
  }
}

export async function updateNews(id: string, news: Partial<News>) {
  try {
    const newsRef = doc(db, 'news', id);
    await updateDoc(newsRef, {
      ...news,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating news:', error);
    throw error;
  }
}

export async function getPublishedNews() {
  try {
    const q = query(collection(db, 'news'), where('published', '==', true));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as News[];
  } catch (error) {
    console.error('Error fetching published news:', error);
    return [];
  }
}
