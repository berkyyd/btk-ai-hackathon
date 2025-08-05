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
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    if (!user) return;

    const fetchLatestAnalysis = async () => {
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
          }
        } catch (indexError) {
          // Composite index gerekli, analiz bulunamadı
        }
      } catch (error) {
        console.error('Analiz yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestAnalysis();
  }, [user]);

  const triggerAnalysis = async () => {
    try {
      setAnalyzing(true);
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
      } else {
        console.error('Analiz yapılamadı');
      }
    } catch (error) {
      console.error('Analiz tetiklenirken hata:', error);
    } finally {
      setAnalyzing(false);
    }
  };

     if (loading) {
     return (
       <Card className="p-6 border-2 border-primary-700/30">
        <div className="flex items-center justify-center py-8">
          <div className="loading-spinner"></div>
          <span className="ml-3 text-text-secondary">Quiz analizi yükleniyor...</span>
        </div>
      </Card>
    );
  }

     if (!analysis) {
     return (
       <Card className="p-6 border-2 border-primary-700/30">
        <div className="text-center py-8">
          <div className="text-text-muted mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Quiz Analizi</h3>
          <p className="text-text-secondary mb-4">Mevcut quiz sonuçlarınıza göre detaylı analiz yapmak için butona tıklayın.</p>
          <button
            onClick={triggerAnalysis}
            disabled={analyzing}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto border border-blue-500/30 shadow-lg hover:shadow-xl"
          >
            {analyzing ? (
              <>
                <div className="loading-spinner mr-2"></div>
                Analiz Yapılıyor...
              </>
            ) : (
              'Analiz Yap'
            )}
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Genel İstatistikler */}
      <Card className="p-6 border-2 border-primary-700/30">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-lg">📊</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Quiz Analizi</h3>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 font-medium">
              Son güncelleme: {lastUpdated}
            </div>
            <div className="text-xs text-gray-500">
              Mevcut quiz verilerinize göre analiz edildi
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60 p-4 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">📝</span>
              </div>
              <div className="text-2xl font-bold text-blue-700">{analysis.totalQuizzes}</div>
            </div>
            <div className="text-sm text-blue-600 font-medium">Toplam Quiz</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/60 p-4 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">📈</span>
              </div>
              <div className="text-2xl font-bold text-green-700">{analysis.averageScore}%</div>
            </div>
            <div className="text-sm text-green-600 font-medium">Ortalama Başarı</div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 p-4 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">⚠️</span>
              </div>
              <div className="text-2xl font-bold text-amber-700">{analysis.weakAreas.length}</div>
            </div>
            <div className="text-sm text-amber-600 font-medium">Zayıf Alan</div>
          </div>
        </div>

        {/* Haftalık Gelişim */}
        {analysis.weeklyProgress && analysis.weeklyProgress.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">📈</span>
              </div>
              <h4 className="text-lg font-bold text-gray-900">Haftalık Gelişim</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {analysis.weeklyProgress.map((week, index) => (
                <div key={index} className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/60 p-3 rounded-xl text-center shadow-sm hover:shadow-md hover:scale-[1.005] transition-all duration-200">
                  <div className="text-lg font-bold text-purple-700">{week.avgScore}%</div>
                  <div className="text-xs text-purple-600 font-medium">{week.quizCount} quiz</div>
                  <div className="text-xs text-purple-500">Hafta {week.week}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Zayıf Alanlar */}
      {analysis.weakAreas.length > 0 && (
        <Card className="p-6 border-2 border-primary-700/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">⚠️</span>
            </div>
            <h4 className="text-lg font-bold text-gray-900">Zayıf Alanlar</h4>
          </div>
          <div className="space-y-3">
            {analysis.weakAreas.map((area, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-200/60 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-full"></div>
                  <span className="font-medium text-gray-800">{area.topic}</span>
                </div>
                <div className="text-sm text-red-600 font-bold bg-red-100 px-3 py-1 rounded-full">
                  {area.errorCount} hata
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* AI Analizi */}
      <Card className="p-6 border-2 border-primary-700/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">🤖</span>
          </div>
          <h4 className="text-lg font-bold text-gray-900">AI Analizi</h4>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200/60 rounded-xl p-4">
          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {analysis.message}
          </div>
        </div>
      </Card>

      {/* Yenile Butonu */}
      <div className="text-center">
        <button
          onClick={triggerAnalysis}
          disabled={analyzing}
          className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-xl hover:from-indigo-700 hover:to-purple-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto border border-indigo-500/30 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
        >
          {analyzing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Analiz Yapılıyor...
            </>
          ) : (
            <>
              <span className="mr-2">🔄</span>
              Analizi Yenile
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default QuizAnalysis; 