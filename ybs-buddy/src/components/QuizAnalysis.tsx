'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import Card from './Card';

interface QuizAnalysis {
  message: string;
  weakAreas: Array<{ topic: string; errorCount: number }>;
  recommendations: string[];
  weeklyProgress: Array<{
    week: number;
    avgScore: number;
    quizCount: number;
  }> | null;
  totalQuizzes: number;
  averageScore: number;
}

const QuizAnalysis: React.FC = () => {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<QuizAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    if (!user) return;

    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        
        // Önce en son analiz sonucunu kontrol et
        const analyticsRef = collection(db, 'userAnalytics');
        const q = query(
          analyticsRef,
          where('userId', '==', user.uid),
          where('type', '==', 'quiz_analysis'),
          orderBy('createdAt', 'desc')
        );
        
        try {
          const snapshot = await getDocs(q);
          const latestAnalysis = snapshot.docs[0];
          
          if (latestAnalysis) {
            const data = latestAnalysis.data();
            setAnalysis(data.data);
            setLastUpdated(new Date(data.createdAt).toLocaleDateString('tr-TR'));
          } else {
            // Analiz yoksa yeni analiz yap
            await triggerAnalysis();
          }
        } catch (indexError) {
          console.log('Composite index gerekli, analiz yeniden yapılıyor...');
          // Index yoksa direkt analiz yap
          await triggerAnalysis();
        }
      } catch (error) {
        console.error('Analiz yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [user]);

  const triggerAnalysis = async () => {
    try {
      const response = await fetch('/api/analytics/quiz-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.uid }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.analysis);
        setLastUpdated(new Date().toLocaleDateString('tr-TR'));
      }
    } catch (error) {
      console.error('Analiz tetiklenirken hata:', error);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Quiz analizi yükleniyor...</span>
        </div>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Henüz Quiz Sonucu Yok</h3>
          <p className="text-gray-500 mb-4">İlk quizinizi tamamladıktan sonra analiz görüntülenecek.</p>
          <button
            onClick={triggerAnalysis}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Analiz Yap
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Genel İstatistikler */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">📊 Quiz Analizi</h3>
          <div className="text-sm text-gray-500">
            Son güncelleme: {lastUpdated}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{analysis.totalQuizzes}</div>
            <div className="text-sm text-blue-700">Toplam Quiz</div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{analysis.averageScore}%</div>
            <div className="text-sm text-green-700">Ortalama Başarı</div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{analysis.weakAreas.length}</div>
            <div className="text-sm text-purple-700">Zayıf Alan</div>
          </div>
        </div>

        {/* Haftalık Gelişim */}
        {analysis.weeklyProgress && analysis.weeklyProgress.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-700 mb-3">📈 Haftalık Gelişim</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {analysis.weeklyProgress.map((week, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-lg font-semibold text-gray-800">{week.avgScore}%</div>
                  <div className="text-xs text-gray-600">{week.quizCount} quiz</div>
                  <div className="text-xs text-gray-500">Hafta {week.week}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Zayıf Alanlar */}
      {analysis.weakAreas.length > 0 && (
        <Card className="p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">⚠️ Zayıf Alanlar</h4>
          <div className="space-y-3">
            {analysis.weakAreas.map((area, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                  <span className="font-medium text-gray-700">{area.topic}</span>
                </div>
                <div className="text-sm text-red-600 font-semibold">
                  {area.errorCount} hata
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* AI Analizi */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">🤖 AI Analizi</h4>
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {analysis.message}
          </div>
        </div>
      </Card>

      {/* Yenile Butonu */}
      <div className="text-center">
        <button
          onClick={triggerAnalysis}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          🔄 Analizi Yenile
        </button>
      </div>
    </div>
  );
};

export default QuizAnalysis; 