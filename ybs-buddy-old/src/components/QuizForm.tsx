import React, { useState } from 'react';
import { QUIZ_DEFAULTS } from '../constants';

interface QuizFormProps {
  onSubmit: (quizData: QuizFormData) => void;
  onCancel: () => void;
  loading: boolean;
  courses: Course[];
}

export interface QuizFormData {
  title: string;
  description: string;
  courseId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  timeLimit: number;
  examFormat: 'test' | 'classic' | 'mixed';
}

interface Course {
  id: string;
  name: string;
  code: string;
}

export default function QuizForm({ onSubmit, onCancel, loading, courses }: QuizFormProps) {
  const [formData, setFormData] = useState<QuizFormData>({
    title: '',
    description: '',
    courseId: '',
    difficulty: 'medium',
    questionCount: QUIZ_DEFAULTS.DEFAULT_QUESTION_COUNT,
    timeLimit: QUIZ_DEFAULTS.DEFAULT_TIME_LIMIT,
    examFormat: 'mixed'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof QuizFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Yeni Sınav Oluştur</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-2">Sınav Başlığı</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text mb-2">Açıklama</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text mb-2">Ders</label>
          <select
            value={formData.courseId}
            onChange={(e) => handleInputChange('courseId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Ders Seçin</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.name} ({course.code})
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text mb-2">Zorluk</label>
          <select
            value={formData.difficulty}
            onChange={(e) => handleInputChange('difficulty', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="easy">Kolay</option>
            <option value="medium">Orta</option>
            <option value="hard">Zor</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text mb-2">Soru Sayısı</label>
          <input
            type="number"
            value={formData.questionCount}
            onChange={(e) => handleInputChange('questionCount', parseInt(e.target.value) || QUIZ_DEFAULTS.DEFAULT_QUESTION_COUNT)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min={QUIZ_DEFAULTS.MIN_QUESTION_COUNT}
            max={QUIZ_DEFAULTS.MAX_QUESTION_COUNT}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text mb-2">Süre (Dakika)</label>
          <input
            type="number"
            value={formData.timeLimit}
            onChange={(e) => handleInputChange('timeLimit', parseInt(e.target.value) || QUIZ_DEFAULTS.DEFAULT_TIME_LIMIT)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min={QUIZ_DEFAULTS.MIN_TIME_LIMIT}
            max={QUIZ_DEFAULTS.MAX_TIME_LIMIT}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-2">Sınav Türü</label>
          <select
            value={formData.examFormat}
            onChange={(e) => handleInputChange('examFormat', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="test">Test (Çoktan Seçmeli)</option>
            <option value="classic">Klasik (Açık Uçlu)</option>
            <option value="mixed">Karışık (Test, Klasik, D/Y, Boşluk Doldurma)</option>
          </select>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Oluşturuluyor...' : 'Sınav Oluştur'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
          >
            İptal
          </button>
        </div>
      </form>
    </div>
  );
} 