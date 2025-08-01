// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Chatbot types
export interface ChatbotRequest {
  question: string;
  userId: string;
  context?: string;
}

export interface ChatbotResponse {
  answer: string;
  sources: string[];
  confidence: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  feedback?: 'helpful' | 'not_helpful' | null;
}

// User data types for chatbot
export interface UserData {
  curriculum: CurriculumData | null;
  courses: CurriculumCourse[];
  notes: Note[];
  quizResults: QuizResult[];
  summarizedNotes: SummarizedNote[];
  userInfo: UserInfo | null;
}

export interface CurriculumData {
  university: string;
  faculty: string;
  department: string;
  curriculum: CurriculumSemester[];
}

export interface CurriculumSemester {
  class: number;
  semester: string;
  courses: CurriculumCourse[];
  elective_courses?: CurriculumCourse[];
}

export interface CurriculumCourse {
  code: string;
  name: string;
  type: string;
  ects: number;
}

export interface UserInfo {
  id: string;
  displayName: string;
  email: string;
  role?: 'student' | 'academician' | 'admin';
}

// Note types
export interface Note {
  id: string;
  title: string;
  content: string;
  courseId: string;
  class: number;
  semester: string;
  role: 'student' | 'academician';
  userId: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt?: Date;
  tags?: string[];
  isPDF?: boolean;
  originalFileName?: string;
  extractedText?: string;
  fileSize?: number;
  fileUrl?: string;
  likes?: number;
  favorites?: number;
}

export interface SummarizedNote {
  id: string;
  userId: string;
  noteId: string;
  originalTitle: string;
  summary: string;
  summaryType: 'academic' | 'casual' | 'exam-focused';
  createdAt: Date;
}

// Quiz types
export interface QuizResult {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: Date;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'open_ended';
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

// Error types
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
} 