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
          console.log('Composite index gerekli, analiz bulunamadı...');
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
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="loading-spinner"></div>
          <span className="ml-3 text-text-secondary">Quiz analizi yükleniyor...</span>
        </div>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="p-6">
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
            className="btn-premium px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
          >
            {analyzing ? (
              <>
                <div className="loading-spinner mr-2"></div>
                Analiz Yapılıyor...
              </>
            ) : (
              '📊 Analiz Yap'
            )}
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
          <h3 className="text-xl font-semibold text-text-primary">📊 Quiz Analizi</h3>
          <div className="text-sm text-text-secondary">
            Son güncelleme: {lastUpdated}
            <br />
            <span className="text-xs text-text-muted">Mevcut quiz verilerinize göre analiz edildi</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-primary-900/20 border border-primary-700/30 p-4 rounded-lg">
            <div className="text-2xl font-bold text-primary-400">{analysis.totalQuizzes}</div>
            <div className="text-sm text-primary-300">Toplam Quiz</div>
          </div>
          <div className="bg-green-900/20 border border-green-700/30 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-400">{analysis.averageScore}%</div>
            <div className="text-sm text-green-300">Ortalama Başarı</div>
          </div>
          <div className="bg-secondary-900/20 border border-secondary-700/30 p-4 rounded-lg">
            <div className="text-2xl font-bold text-secondary-400">{analysis.weakAreas.length}</div>
            <div className="text-sm text-secondary-300">Zayıf Alan</div>
          </div>
        </div>

        {/* Haftalık Gelişim */}
        {analysis.weeklyProgress && analysis.weeklyProgress.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-text-primary mb-3">📈 Haftalık Gelişim</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {analysis.weeklyProgress.map((week, index) => (
                <div key={index} className="bg-primary-900/10 border border-primary-700/30 p-3 rounded-lg text-center">
                  <div className="text-lg font-semibold text-text-primary">{week.avgScore}%</div>
                  <div className="text-xs text-text-secondary">{week.quizCount} quiz</div>
                  <div className="text-xs text-text-muted">Hafta {week.week}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Zayıf Alanlar */}
      {analysis.weakAreas.length > 0 && (
        <Card className="p-6">
          <h4 className="text-lg font-semibold text-text-primary mb-4">⚠️ Zayıf Alanlar</h4>
          <div className="space-y-3">
            {analysis.weakAreas.map((area, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-900/20 rounded-lg border border-red-700/30">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-400 rounded-full mr-3"></div>
                  <span className="font-medium text-text-primary">{area.topic}</span>
                </div>
                <div className="text-sm text-red-400 font-semibold">
                  {area.errorCount} hata
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* AI Analizi */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-text-primary mb-4">🤖 AI Analizi</h4>
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap text-text-secondary leading-relaxed">
            {analysis.message}
          </div>
        </div>
      </Card>

      {/* Yenile Butonu */}
      <div className="text-center">
        <button
          onClick={triggerAnalysis}
          disabled={analyzing}
          className="btn-premium px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
        >
          {analyzing ? (
            <>
              <div className="loading-spinner mr-2"></div>
              Analiz Yapılıyor...
            </>
          ) : (
            '🔄 Analizi Yenile'
          )}
        </button>
      </div>
    </div>
  );
};

export default QuizAnalysis; 