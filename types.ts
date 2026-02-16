export type UserRole = 'student' | 'teacher' | 'admin';

export interface Enrollment {
  id: string;
  teacherId: string;
  studentId: string;
  status: 'pending' | 'approved' | 'rejected';
  message: string | null;
  teacher?: User;
  student?: User;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  xp: number;
  level: number;
  currentStreak: number;
  access_token?: string;
  avatar?: string;
  bio?: string;
  studentEnrollments?: Enrollment[];
  teacherEnrollments?: Enrollment[];
}

export interface WeeklyGoal {
  words: string[];
  grammar: string;
  teacherNote: string;
  id: string;
}

export interface LearningPathItem {
  id: string;
  title: string;
  category: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  status: 'Complete' | 'Active' | 'Locked';
  description: string;
  percentage?: number;
  learned?: number;
  total?: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum AppTab {
  DASHBOARD = 'dashboard',
  PATHWAY = 'pathway',
  AI_TUTOR = 'tutor',
  LIBRARY = 'library',
  STUDENTS = 'students',
  TEACHERS = 'teachers',
  GRAMMAR = 'grammar',
  SETTINGS = 'settings'
}
