const API_BASE_URL = '/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Bir hata oluştu',
        };
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error('API request error:', error);
      return {
        success: false,
        error: 'Bağlantı hatası',
      };
    }
  }

  // Authentication
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, displayName?: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    });
  }

  // Courses
  async getCourses(params?: {
    classYear?: number;
    semester?: string;
    courseType?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.classYear) searchParams.append('classYear', params.classYear.toString());
    if (params?.semester) searchParams.append('semester', params.semester);
    if (params?.courseType) searchParams.append('courseType', params.courseType);

    const queryString = searchParams.toString();
    const endpoint = `/courses${queryString ? `?${queryString}` : ''}`;

    return this.request(endpoint);
  }

  async addCourse(courseData: {
    name: string;
    code: string;
    classYear: number;
    semester: string;
    courseType: string;
    credits?: number;
    description?: string;
  }) {
    return this.request('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  // Notes
  async getNotes(params?: {
    classYear?: number;
    semester?: string;
    courseId?: string;
    search?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.classYear) searchParams.append('classYear', params.classYear.toString());
    if (params?.semester) searchParams.append('semester', params.semester);
    if (params?.courseId) searchParams.append('courseId', params.courseId);
    if (params?.search) searchParams.append('search', params.search);

    const queryString = searchParams.toString();
    const endpoint = `/notes${queryString ? `?${queryString}` : ''}`;

    return this.request(endpoint);
  }

  async addNote(noteData: {
    title: string;
    content: string;
    courseId: string;
    classYear?: number;
    semester?: string;
    tags?: string[];
    isPublic?: boolean;
  }) {
    return this.request('/notes', {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  }

  // Quiz
  async generateQuiz(quizData: {
    courseId: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    questionCount: number;
    timeLimit?: number;
    examFormat?: 'test' | 'classic' | 'mixed';
  }) {
    return this.request('/quiz/generate', {
      method: 'POST',
      body: JSON.stringify(quizData),
    });
  }

  // Quiz sonucu kaydet
  async submitQuiz(resultData: any) {
    return this.request('/quiz/submit', {
      method: 'POST',
      body: JSON.stringify(resultData),
    });
  }

  // Note Summarization
  async summarizeNote(noteId: string, category: string) {
    return this.request('/notes/summarize', {
      method: 'POST',
      body: JSON.stringify({ noteId, category }),
    });
  }

  // Summarized Notes
  async saveSummarizedNote(noteId: string, summarizedContent: string, category: string) {
    return this.request('/profile/summarized-notes', {
      method: 'POST',
      body: JSON.stringify({ noteId, summarizedContent, category }),
    });
  }

  async getSummarizedNotes() {
    return this.request('/profile/summarized-notes');
  }
}

export const apiClient = new ApiClient(); 