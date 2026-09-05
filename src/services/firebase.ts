import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  limit,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import type { LearnerProfile, AppSettings, LearningReport } from '../types';

// Initialize Firebase App singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Structured Firestore Error Context
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ----------------------------------------------------
// Firestore Cloud Persistence API
// ----------------------------------------------------

/**
 * Persist learner profile to /users/{userId}
 */
export async function saveUserProfileToFirestore(
  profile: LearnerProfile,
  email?: string | null
): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const path = `users/${user.uid}`;
  try {
    const payload = {
      userId: user.uid,
      name: profile.name || user.displayName || 'Student',
      email: email || user.email || '',
      educationalLevel: profile.educationalLevel || 'Beginner',
      existingKnowledge: profile.existingKnowledge || 'Basic understanding',
      learningObjective: profile.learningObjective || 'Understand concept',
      preferredLanguage: profile.preferredLanguage || 'English',
      preferredTeachingStyle: profile.preferredTeachingStyle || 'Example-driven',
      availableTime: profile.availableTime || '20 minutes',
      desiredDepth: profile.desiredDepth || 'Standard',
      naturalLanguageInstruction: profile.naturalLanguageInstruction || '',
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', user.uid), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Load learner profile from /users/{userId}
 */
export async function getUserProfileFromFirestore(userId: string): Promise<LearnerProfile | null> {
  const path = `users/${userId}`;
  try {
    const docSnap = await getDoc(doc(db, 'users', userId));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        name: data.name,
        educationalLevel: data.educationalLevel,
        existingKnowledge: data.existingKnowledge,
        learningObjective: data.learningObjective,
        preferredLanguage: data.preferredLanguage,
        preferredTeachingStyle: data.preferredTeachingStyle,
        availableTime: data.availableTime,
        desiredDepth: data.desiredDepth,
        naturalLanguageInstruction: data.naturalLanguageInstruction,
      };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Persist app settings to /users/{userId}/settings/current
 */
export async function saveUserSettingsToFirestore(settings: AppSettings): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const path = `users/${user.uid}/settings/current`;
  try {
    await setDoc(doc(db, 'users', user.uid, 'settings', 'current'), {
      userId: user.uid,
      ...settings,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Retrieve app settings from /users/{userId}/settings/current
 */
export async function getUserSettingsFromFirestore(userId: string): Promise<AppSettings | null> {
  const path = `users/${userId}/settings/current`;
  try {
    const snap = await getDoc(doc(db, 'users', userId, 'settings', 'current'));
    if (snap.exists()) {
      const data = snap.data();
      return {
        preferredVoice: data.preferredVoice || 'Kore',
        speechRate: data.speechRate || 1.0,
        autoPlayVoice: data.autoPlayVoice ?? true,
        showSubtitles: data.showSubtitles ?? true,
        avatarStyle: data.avatarStyle || 'avatar-female',
        theme: data.theme || 'light',
        visualDensity: data.visualDensity || 'comfortable',
      };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export interface LessonRecord {
  id: string;
  userId: string;
  topic: string;
  completedSections: number;
  totalSections: number;
  status: 'in_progress' | 'completed';
  score?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Save completed or in-progress lesson to /users/{userId}/lessons/{lessonId}
 */
export async function saveLessonRecordToFirestore(
  lesson: Omit<LessonRecord, 'userId' | 'createdAt' | 'updatedAt'>
): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const path = `users/${user.uid}/lessons/${lesson.id}`;
  try {
    const payload: LessonRecord = {
      ...lesson,
      userId: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', user.uid, 'lessons', lesson.id), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Fetch recent lesson history for current user
 */
export async function getUserLessonsFromFirestore(userId: string): Promise<LessonRecord[]> {
  const path = `users/${userId}/lessons`;
  try {
    const q = query(collection(db, 'users', userId, 'lessons'), limit(15));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as LessonRecord);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export interface StoredReportRecord {
  id: string;
  userId: string;
  topic: string;
  overallScore: number;
  letterGrade: string;
  masteryStatus: string;
  report: LearningReport;
  createdAt: string;
}

/**
 * Save diagnostic report to /users/{userId}/reports/{reportId}
 */
export async function saveLearningReportToFirestore(
  reportId: string,
  report: LearningReport
): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const path = `users/${user.uid}/reports/${reportId}`;
  try {
    const payload: StoredReportRecord = {
      id: reportId,
      userId: user.uid,
      topic: report.topic,
      overallScore: report.overallScore,
      letterGrade: report.letterGrade,
      masteryStatus: report.masteryStatus,
      report,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', user.uid, 'reports', reportId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Retrieve saved reports from /users/{userId}/reports
 */
export async function getUserReportsFromFirestore(userId: string): Promise<StoredReportRecord[]> {
  const path = `users/${userId}/reports`;
  try {
    const q = query(collection(db, 'users', userId, 'reports'), limit(10));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as StoredReportRecord);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// Google Sign In
export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

// Email/Password Signup
export async function signUpWithEmail(
  name: string,
  email: string,
  password: string
): Promise<User> {
  const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  if (name.trim()) {
    try {
      await updateProfile(userCredential.user, {
        displayName: name.trim(),
      });
    } catch (e) {
      console.warn('Could not update displayName:', e);
    }
  }
  return userCredential.user;
}

// Email/Password Signin
export async function signInWithEmail(email: string, password: string): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
  return userCredential.user;
}

// Password Reset
export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

// Logout
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Auth state observer
export function subscribeToAuthChanges(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Clean Human-Readable Error Formatting
export function formatAuthError(error: any): string {
  if (!error) return 'An unexpected error occurred. Please try again.';
  const code = error.code || '';
  const message = error.message || '';

  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please check your spelling or sign up.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please verify your credentials and try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completion. Please try again.';
    case 'auth/cancelled-popup-request':
      return 'Authentication request was superseded. Please try again.';
    case 'auth/network-request-failed':
      return 'Network connection problem. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Access temporarily disabled due to multiple failed login attempts. Try again later or reset password.';
    case 'auth/user-disabled':
      return 'This user account has been disabled. Please contact support.';
    default:
      if (message.includes('popup-closed')) {
        return 'Google sign-in was cancelled.';
      }
      return 'Authentication could not be completed. Please check your input and try again.';
  }
}

// Utility to generate initials from full name or email
export function getUserInitials(name?: string | null, email?: string | null): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email && email.trim()) {
    return email.trim().slice(0, 2).toUpperCase();
  }
  return 'AT';
}
