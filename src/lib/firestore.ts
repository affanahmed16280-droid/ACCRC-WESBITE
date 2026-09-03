import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  type DocumentData,
  type QueryConstraint,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";

/* ─── Types ─── */

export interface FirestoreEvent {
  id: string;
  name: string;
  description: string;
  date: Date;
  location: string;
  registrationOpensAt: Date;
  registrationClosesAt: Date;
  imageUrl?: string;
  createdAt: Date;
}

export interface FirestoreNews {
  id: string;
  title: string;
  body: string;
  excerpt: string;
  imageUrl?: string;
  publishedAt: Date;
  createdAt: Date;
}

export interface Registration {
  id?: string;
  type: "membership" | "event";
  eventId?: string;
  name: string;
  email: string;
  phone: string;
  classSection: string;
  rollNumber: string;
  areaOfInterest: string;
  motivation: string;
  createdAt?: Date;
}

export interface Application {
  id?: string;
  type: "sub-executive" | "executive";
  email: string;
  idNumber: string;
  section: string;
  pastExperience: string;
  visionStatement: string;
  roleApplyingFor: string;
  createdAt?: Date;
}

export interface PortalConfig {
  subExecOpen: boolean;
  execOpen: boolean;
  subExecRoles: string[];
  execRoles: string[];
}

/* ─── Helpers ─── */

function toDate(ts: unknown): Date {
  if (ts instanceof Timestamp) return ts.toDate();
  if (ts instanceof Date) return ts;
  if (ts && typeof ts === "object" && "seconds" in ts) {
    return new Date((ts as { seconds: number }).seconds * 1000);
  }
  return new Date();
}

function parseEvent(id: string, data: DocumentData): FirestoreEvent {
  return {
    id,
    name: data.name || "",
    description: data.description || "",
    date: toDate(data.date),
    location: data.location || "",
    registrationOpensAt: toDate(data.registrationOpensAt),
    registrationClosesAt: toDate(data.registrationClosesAt),
    imageUrl: data.imageUrl || undefined,
    createdAt: toDate(data.createdAt),
  };
}

function parseNews(id: string, data: DocumentData): FirestoreNews {
  return {
    id,
    title: data.title || "",
    body: data.body || "",
    excerpt: data.excerpt || "",
    imageUrl: data.imageUrl || undefined,
    publishedAt: toDate(data.publishedAt),
    createdAt: toDate(data.createdAt),
  };
}

/* ─── Events ─── */

export async function getEvents(): Promise<FirestoreEvent[]> {
  const q = query(collection(db, "events"), orderBy("date", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => parseEvent(d.id, d.data()));
}

export async function getEvent(id: string): Promise<FirestoreEvent | null> {
  const docRef = doc(db, "events", id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return parseEvent(snapshot.id, snapshot.data());
}

export function subscribeToEvents(callback: (events: FirestoreEvent[]) => void): Unsubscribe {
  const q = query(collection(db, "events"), orderBy("date", "desc"));
  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map((d) => parseEvent(d.id, d.data()));
    callback(events);
  });
}

export function subscribeToEvent(id: string, callback: (event: FirestoreEvent | null) => void): Unsubscribe {
  const docRef = doc(db, "events", id);
  return onSnapshot(docRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }
    callback(parseEvent(snapshot.id, snapshot.data()));
  });
}

export async function createEvent(data: Omit<FirestoreEvent, "id" | "createdAt">): Promise<string> {
  const docRef = await addDoc(collection(db, "events"), {
    ...data,
    date: Timestamp.fromDate(data.date),
    registrationOpensAt: Timestamp.fromDate(data.registrationOpensAt),
    registrationClosesAt: Timestamp.fromDate(data.registrationClosesAt),
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateEvent(id: string, data: Partial<Omit<FirestoreEvent, "id" | "createdAt">>): Promise<void> {
  const updateData: Record<string, unknown> = { ...data };
  if (data.date) updateData.date = Timestamp.fromDate(data.date);
  if (data.registrationOpensAt) updateData.registrationOpensAt = Timestamp.fromDate(data.registrationOpensAt);
  if (data.registrationClosesAt) updateData.registrationClosesAt = Timestamp.fromDate(data.registrationClosesAt);
  await updateDoc(doc(db, "events", id), updateData);
}

export async function deleteEvent(id: string): Promise<void> {
  await deleteDoc(doc(db, "events", id));
}

/* ─── News ─── */

export async function getNewsPosts(): Promise<FirestoreNews[]> {
  const q = query(collection(db, "news"), orderBy("publishedAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => parseNews(d.id, d.data()));
}

export async function getNewsPost(id: string): Promise<FirestoreNews | null> {
  const docRef = doc(db, "news", id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return parseNews(snapshot.id, snapshot.data());
}

export async function getLatestNews(count: number = 3): Promise<FirestoreNews[]> {
  const q = query(collection(db, "news"), orderBy("publishedAt", "desc"), limit(count));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => parseNews(d.id, d.data()));
}

export async function createNewsPost(data: Omit<FirestoreNews, "id" | "createdAt">): Promise<string> {
  const docRef = await addDoc(collection(db, "news"), {
    ...data,
    publishedAt: Timestamp.fromDate(data.publishedAt),
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateNewsPost(id: string, data: Partial<Omit<FirestoreNews, "id" | "createdAt">>): Promise<void> {
  const updateData: Record<string, unknown> = { ...data };
  if (data.publishedAt) updateData.publishedAt = Timestamp.fromDate(data.publishedAt);
  await updateDoc(doc(db, "news", id), updateData);
}

export async function deleteNewsPost(id: string): Promise<void> {
  await deleteDoc(doc(db, "news", id));
}

/* ─── Registrations ─── */

export async function submitRegistration(data: Omit<Registration, "id" | "createdAt">): Promise<string> {
  const docRef = await addDoc(collection(db, "registrations"), {
    ...data,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function getRegistrations(filters?: { type?: string; eventId?: string }): Promise<Registration[]> {
  const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];
  if (filters?.type) constraints.unshift(where("type", "==", filters.type));
  if (filters?.eventId) constraints.unshift(where("eventId", "==", filters.eventId));
  const q = query(collection(db, "registrations"), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: toDate(d.data().createdAt) } as Registration));
}

/* ─── Applications ─── */

export async function submitApplication(data: Omit<Application, "id" | "createdAt">): Promise<string> {
  const docRef = await addDoc(collection(db, "applications"), {
    ...data,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function getApplications(type?: "sub-executive" | "executive"): Promise<Application[]> {
  const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];
  if (type) constraints.unshift(where("type", "==", type));
  const q = query(collection(db, "applications"), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: toDate(d.data().createdAt) } as Application));
}

/* ─── Portal Config ─── */

export async function getPortalConfig(): Promise<PortalConfig> {
  const docRef = doc(db, "config", "portal");
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) {
    return { subExecOpen: false, execOpen: false, subExecRoles: [], execRoles: [] };
  }
  return snapshot.data() as PortalConfig;
}

export function subscribeToPortalConfig(callback: (config: PortalConfig) => void): Unsubscribe {
  const docRef = doc(db, "config", "portal");
  return onSnapshot(docRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback({ subExecOpen: false, execOpen: false, subExecRoles: [], execRoles: [] });
      return;
    }
    callback(snapshot.data() as PortalConfig);
  });
}

export async function updatePortalConfig(data: Partial<PortalConfig>): Promise<void> {
  await updateDoc(doc(db, "config", "portal"), data);
}
