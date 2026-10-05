import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  deleteField,
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
  registrationOpensAt?: Date;
  registrationClosesAt?: Date;
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

export interface FirestoreAchievement {
  id: string;
  title: string;
  recipients: string;
  competition: string;
  level: "Global" | "National";
  year: number;
  createdAt: Date;
}

export interface Registration {
  id?: string;
  type: "membership" | "event";
  eventId?: string;
  name: string;
  email: string;
  whatsapp?: string;
  collegeId?: string;
  classSection: string;
  motivation: string;
  phone?: string;
  rollNumber?: string;
  areaOfInterest?: string;
  bloodGroup?: string;
  createdAt?: Date;
}

export interface Application {
  id?: string;
  type: "sub-executive" | "executive" | "prefect";
  name: string;
  email: string;
  whatsapp?: string;
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
  prefectOpen: boolean;
  subExecRoles: string[];
  execRoles: string[];
  prefectRoles: string[];
}

export const defaultPortalConfig: PortalConfig = {
  subExecOpen: false,
  execOpen: false,
  prefectOpen: false,
  subExecRoles: [],
  execRoles: [],
  prefectRoles: [],
};

/* ─── Helpers ─── */

function toDate(ts: unknown): Date {
  if (ts instanceof Timestamp) return ts.toDate();
  if (ts instanceof Date) return ts;
  if (ts && typeof ts === "object" && "seconds" in ts) {
    return new Date((ts as { seconds: number }).seconds * 1000);
  }
  return new Date();
}

function toOptionalDate(ts: unknown): Date | undefined {
  if (!ts) return undefined;
  return toDate(ts);
}

function parsePortalConfig(data: DocumentData | undefined): PortalConfig {
  return {
    ...defaultPortalConfig,
    ...(data ?? {}),
    subExecRoles: Array.isArray(data?.subExecRoles) ? data.subExecRoles : [],
    execRoles: Array.isArray(data?.execRoles) ? data.execRoles : [],
    prefectRoles: Array.isArray(data?.prefectRoles) ? data.prefectRoles : [],
  };
}

function parseEvent(id: string, data: DocumentData): FirestoreEvent {
  return {
    id,
    name: data.name || "",
    description: data.description || "",
    date: toDate(data.date),
    location: data.location || "",
    registrationOpensAt: toOptionalDate(data.registrationOpensAt),
    registrationClosesAt: toOptionalDate(data.registrationClosesAt),
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

function parseAchievement(id: string, data: DocumentData): FirestoreAchievement {
  const year = Number(data.year);

  return {
    id,
    title: data.title || "",
    recipients: data.recipients || "",
    competition: data.competition || "",
    level: data.level === "Global" ? "Global" : "National",
    year: Number.isInteger(year) && year >= 1900 && year <= 9999 ? year : new Date().getFullYear(),
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

export function subscribeToEvents(
  callback: (events: FirestoreEvent[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(collection(db, "events"), orderBy("date", "desc"));
  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map((d) => parseEvent(d.id, d.data()));
    callback(events);
  }, onError);
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
  const { registrationOpensAt, registrationClosesAt, ...eventData } = data;
  const docRef = await addDoc(collection(db, "events"), {
    ...eventData,
    date: Timestamp.fromDate(data.date),
    ...(registrationOpensAt ? { registrationOpensAt: Timestamp.fromDate(registrationOpensAt) } : {}),
    ...(registrationClosesAt ? { registrationClosesAt: Timestamp.fromDate(registrationClosesAt) } : {}),
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateEvent(id: string, data: Partial<Omit<FirestoreEvent, "id" | "createdAt">>): Promise<void> {
  const updateData: Record<string, unknown> = { ...data };
  if (data.date) updateData.date = Timestamp.fromDate(data.date);
  if ("registrationOpensAt" in data) {
    updateData.registrationOpensAt = data.registrationOpensAt
      ? Timestamp.fromDate(data.registrationOpensAt)
      : deleteField();
  }
  if ("registrationClosesAt" in data) {
    updateData.registrationClosesAt = data.registrationClosesAt
      ? Timestamp.fromDate(data.registrationClosesAt)
      : deleteField();
  }
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

/* ─── Achievements ─── */

export async function getAchievements(): Promise<FirestoreAchievement[]> {
  const snapshot = await getDocs(collection(db, "achievements"));
  return snapshot.docs
    .map((document) => parseAchievement(document.id, document.data()))
    .sort((a, b) => b.year - a.year || b.createdAt.getTime() - a.createdAt.getTime());
}

export function subscribeToAchievements(
  callback: (achievements: FirestoreAchievement[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  return onSnapshot(collection(db, "achievements"), (snapshot) => {
    callback(
      snapshot.docs
        .map((document) => parseAchievement(document.id, document.data()))
        .sort((a, b) => b.year - a.year || b.createdAt.getTime() - a.createdAt.getTime())
    );
  }, onError);
}

export async function createAchievement(data: Omit<FirestoreAchievement, "id" | "createdAt">): Promise<string> {
  const docRef = await addDoc(collection(db, "achievements"), {
    ...data,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateAchievement(
  id: string,
  data: Partial<Omit<FirestoreAchievement, "id" | "createdAt">>
): Promise<void> {
  await updateDoc(doc(db, "achievements", id), data);
}

export async function deleteAchievement(id: string): Promise<void> {
  await deleteDoc(doc(db, "achievements", id));
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

export async function deleteRegistration(id: string): Promise<void> {
  await deleteDoc(doc(db, "registrations", id));
}

/* ─── Applications ─── */

export async function submitApplication(data: Omit<Application, "id" | "createdAt">): Promise<string> {
  const docRef = await addDoc(collection(db, "applications"), {
    ...data,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function getApplications(type?: Application["type"]): Promise<Application[]> {
  const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];
  if (type) constraints.unshift(where("type", "==", type));
  const q = query(collection(db, "applications"), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: toDate(d.data().createdAt) } as Application));
}

export async function deleteApplication(id: string): Promise<void> {
  await deleteDoc(doc(db, "applications", id));
}

/* ─── Portal Config ─── */

export async function getPortalConfig(): Promise<PortalConfig> {
  const docRef = doc(db, "config", "portal");
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) {
    return defaultPortalConfig;
  }
  return parsePortalConfig(snapshot.data());
}

export function subscribeToPortalConfig(callback: (config: PortalConfig) => void): Unsubscribe {
  const docRef = doc(db, "config", "portal");
  return onSnapshot(docRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(defaultPortalConfig);
      return;
    }
    callback(parsePortalConfig(snapshot.data()));
  });
}

export async function updatePortalConfig(data: Partial<PortalConfig>): Promise<void> {
  await setDoc(doc(db, "config", "portal"), data, { merge: true });
}

/* ─── Fest Types ─── */

export interface FestMember {
  name: string;
  institution?: string;
  phone?: string;
  email?: string;
}

export interface FestSegment {
  id: string;
  title: string;
  category: string;
  description: string;
  teamMin: number;
  teamMax: number;
  registrationFee: number;
  prizePool?: string;
  rulesUrl?: string;
  rulesText?: string;
  venue?: string;
  scheduleTime?: string;
  isOpen: boolean;
  createdAt: Date;
}

export interface FestRegistration {
  id?: string;
  segmentId: string;
  segmentTitle: string;
  teamName: string;
  institution: string;
  leaderName: string;
  leaderEmail: string;
  leaderPhone: string;
  leaderWhatsapp?: string;
  members: FestMember[];
  transactionId?: string;
  paymentMethod?: string;
  status: 'pending' | 'verified' | 'rejected';
  notes?: string;
  createdAt?: Date;
}

export interface FestScheduleItem {
  id?: string;
  day: string;
  time: string;
  segmentTitle: string;
  stage: string;
  venue: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface FestAnnouncement {
  id?: string;
  title: string;
  body: string;
  tag: 'Notice' | 'Result' | 'Schedule' | 'Urgent';
  isLive: boolean;
  createdAt: Date;
}

/* ─── Default Starter Segments ─── */

export const DEFAULT_FEST_SEGMENTS: Omit<FestSegment, 'id' | 'createdAt'>[] = [
  {
    title: 'Autonomous Line Follower (LFR)',
    category: 'Robotics',
    description: 'High-speed autonomous line follower robots navigating complex curves, intersections, and sharp angles on a custom matte arena.',
    teamMin: 1,
    teamMax: 4,
    registrationFee: 1000,
    prizePool: '৳ 35,000',
    rulesUrl: 'https://accrc.pages.dev/rules/lfr.pdf',
    venue: 'College Gymnasium Arena A',
    scheduleTime: 'Day 1 · 09:30 AM',
    isOpen: true,
  },
  {
    title: 'Robo Soccer Challenge',
    category: 'Robotics',
    description: 'Manual or wireless controlled combat-style robotic soccer matches with fast-paced dribbling and defense strategies.',
    teamMin: 2,
    teamMax: 4,
    registrationFee: 1200,
    prizePool: '৳ 30,000',
    rulesUrl: 'https://accrc.pages.dev/rules/soccer.pdf',
    venue: 'Auditorium Quad Field',
    scheduleTime: 'Day 1 · 01:30 PM',
    isOpen: true,
  },
  {
    title: 'Project Showcase & Innovation Display',
    category: 'Innovation',
    description: 'Present hardware and IoT prototypes solving real-world challenges in agriculture, healthcare, automation, or clean energy.',
    teamMin: 1,
    teamMax: 3,
    registrationFee: 800,
    prizePool: '৳ 25,000',
    rulesUrl: 'https://accrc.pages.dev/rules/project.pdf',
    venue: 'Main Science Gallery Hall',
    scheduleTime: 'Day 2 · 10:00 AM',
    isOpen: true,
  },
  {
    title: 'National Tech & Robotics Olympiad',
    category: 'Olympiad',
    description: 'Individual competitive test assessing electronics, microcontrollers, algorithms, and computational robotics principles.',
    teamMin: 1,
    teamMax: 1,
    registrationFee: 300,
    prizePool: '৳ 15,000',
    rulesUrl: 'https://accrc.pages.dev/rules/olympiad.pdf',
    venue: 'Hall Room 301-304',
    scheduleTime: 'Day 2 · 09:00 AM',
    isOpen: true,
  },
  {
    title: 'CAD & 3D Mechanism Design',
    category: 'Engineering',
    description: 'Live 3-hour mechanical modeling sprint in SolidWorks/Fusion360 designing a precision robotic gripper or chassis.',
    teamMin: 1,
    teamMax: 2,
    registrationFee: 500,
    prizePool: '৳ 15,000',
    venue: 'Advanced Computer Lab 2',
    scheduleTime: 'Day 1 · 11:00 AM',
    isOpen: true,
  },
  {
    title: 'Speed Circuit & Soldering Sprint',
    category: 'Hardware',
    description: 'Precision circuit debugging and live high-speed soldering competition tested on real-time hardware diagnostics.',
    teamMin: 1,
    teamMax: 2,
    registrationFee: 500,
    prizePool: '৳ 12,000',
    venue: 'Electronics Lab 1',
    scheduleTime: 'Day 2 · 02:00 PM',
    isOpen: true,
  },
];

/* ─── Fest Segments ─── */

function parseFestSegment(id: string, data: DocumentData): FestSegment {
  return {
    id,
    title: data.title || '',
    category: data.category || 'Robotics',
    description: data.description || '',
    teamMin: Number(data.teamMin) || 1,
    teamMax: Number(data.teamMax) || 4,
    registrationFee: Number(data.registrationFee) || 0,
    prizePool: data.prizePool || '',
    rulesUrl: data.rulesUrl || '',
    rulesText: data.rulesText || '',
    venue: data.venue || '',
    scheduleTime: data.scheduleTime || '',
    isOpen: data.isOpen !== false,
    createdAt: toDate(data.createdAt),
  };
}

export async function getFestSegments(): Promise<FestSegment[]> {
  try {
    const q = query(collection(db, "fest_segments"), orderBy("createdAt", "asc"));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return DEFAULT_FEST_SEGMENTS.map((seg, i) => ({
        ...seg,
        id: `default-${i}`,
        createdAt: new Date(),
      }));
    }
    return snapshot.docs.map((d) => parseFestSegment(d.id, d.data()));
  } catch (error) {
    console.error('Error fetching fest segments:', error);
    return DEFAULT_FEST_SEGMENTS.map((seg, i) => ({
      ...seg,
      id: `default-${i}`,
      createdAt: new Date(),
    }));
  }
}

export function subscribeToFestSegments(
  callback: (segments: FestSegment[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(collection(db, "fest_segments"), orderBy("createdAt", "asc"));
  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        callback(
          DEFAULT_FEST_SEGMENTS.map((seg, i) => ({
            ...seg,
            id: `default-${i}`,
            createdAt: new Date(),
          }))
        );
        return;
      }
      callback(snapshot.docs.map((d) => parseFestSegment(d.id, d.data())));
    },
    (err) => {
      console.warn('Realtime fest segments notice:', err);
      callback(
        DEFAULT_FEST_SEGMENTS.map((seg, i) => ({
          ...seg,
          id: `default-${i}`,
          createdAt: new Date(),
        }))
      );
      onError?.(err);
    }
  );
}

export async function createFestSegment(data: Omit<FestSegment, "id" | "createdAt">): Promise<string> {
  const docRef = await addDoc(collection(db, "fest_segments"), {
    ...data,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateFestSegment(id: string, data: Partial<Omit<FestSegment, "id" | "createdAt">>): Promise<void> {
  await updateDoc(doc(db, "fest_segments", id), {
    ...data,
  });
}

export async function deleteFestSegment(id: string): Promise<void> {
  await deleteDoc(doc(db, "fest_segments", id));
}

/* ─── Fest Registrations ─── */

export async function submitFestRegistration(data: Omit<FestRegistration, "id" | "createdAt">): Promise<string> {
  const docRef = await addDoc(collection(db, "fest_registrations"), {
    ...data,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function getFestRegistrations(filters?: { segmentId?: string; status?: string }): Promise<FestRegistration[]> {
  try {
    const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];
    if (filters?.segmentId) constraints.unshift(where("segmentId", "==", filters.segmentId));
    if (filters?.status) constraints.unshift(where("status", "==", filters.status));
    const q = query(collection(db, "fest_registrations"), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: toDate(d.data().createdAt),
    } as FestRegistration));
  } catch (error) {
    console.error('Error fetching fest registrations:', error);
    return [];
  }
}

export async function updateFestRegistrationStatus(
  id: string,
  status: FestRegistration["status"],
  notes?: string
): Promise<void> {
  const payload: Record<string, unknown> = { status };
  if (notes !== undefined) payload.notes = notes;
  await updateDoc(doc(db, "fest_registrations", id), payload);
}

export async function deleteFestRegistration(id: string): Promise<void> {
  await deleteDoc(doc(db, "fest_registrations", id));
}

/* ─── Fest Schedules ─── */

export async function getFestSchedule(): Promise<FestScheduleItem[]> {
  try {
    const snapshot = await getDocs(collection(db, "fest_schedule"));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as FestScheduleItem));
  } catch (error) {
    console.error('Error fetching fest schedule:', error);
    return [];
  }
}

export async function createFestScheduleItem(data: Omit<FestScheduleItem, "id">): Promise<string> {
  const docRef = await addDoc(collection(db, "fest_schedule"), data);
  return docRef.id;
}

export async function deleteFestScheduleItem(id: string): Promise<void> {
  await deleteDoc(doc(db, "fest_schedule", id));
}

/* ─── Fest Announcements ─── */

export async function getFestAnnouncements(): Promise<FestAnnouncement[]> {
  try {
    const q = query(collection(db, "fest_announcements"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: toDate(d.data().createdAt),
    } as FestAnnouncement));
  } catch (error) {
    console.error('Error fetching fest announcements:', error);
    return [];
  }
}

export function subscribeToFestAnnouncements(
  callback: (announcements: FestAnnouncement[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(collection(db, "fest_announcements"), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snapshot) => {
      callback(
        snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          createdAt: toDate(d.data().createdAt),
        } as FestAnnouncement))
      );
    },
    onError
  );
}

export async function createFestAnnouncement(data: Omit<FestAnnouncement, "id" | "createdAt">): Promise<string> {
  const docRef = await addDoc(collection(db, "fest_announcements"), {
    ...data,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function deleteFestAnnouncement(id: string): Promise<void> {
  await deleteDoc(doc(db, "fest_announcements", id));
}

