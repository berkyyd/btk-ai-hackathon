'use client'

import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { collection, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { QuizResult, Answer } from "../../types/quiz";
import { geminiService } from '../../utils/geminiService';
import Card from '../../components/Card';
import QuizAnalysis from '../../components/QuizAnalysis';
import LoginPrompt from '../../components/LoginPrompt';

const KisiselTakipPage = () => {
  const { user, role, loading } = useAuth();
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [loadingResults, setLoadingResults] = useState(true);
  const [explanations, setExplanations] = useState<{ [answerId: string]: string }>({});

  // Quiz sonuçlarını yükle
  const fetchResults = async () => {
    if (!user?.uid) return;
    
    try {
      setLoadingResults(true);
      const resultsRef = collection(db, "quizResults");
      const q = query(resultsRef, where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      const results: QuizResult[] = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as QuizResult[];
      
      // Tarihe göre sırala (en yeni önce)
      results.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
      setQuizResults(results);
    } catch (error) {
      console.error("Quiz sonuçları yüklenirken hata:", error);
    } finally {
      setLoadingResults(false);
    }
  };

  // Açıklamaları yükle
  const fetchExplanations = async () => {
    if (!user?.uid) return;
    
    try {
      const explanationsRef = collection(db, "explanations");
      const q = query(explanationsRef, where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      const explanationsData: { [answerId: string]: string } = {};
      
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.answerId && data.explanation) {
          explanationsData[data.answerId] = data.explanation;
        }
      });
      
      setExplanations(explanationsData);
    } catch (error) {
      console.error("Açıklamalar yüklenirken hata:", error);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      fetchResults();
      fetchExplanations();
    }
  }, [user?.uid]);

  const handleDeleteQuizResult = async (resultId: string, score: number) => {
    if (!confirm(`Bu quiz sonucunu (${score} puan) silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'quizResults', resultId));
      alert('Quiz sonucu başarıyla silindi!');
      fetchResults(); // Sonuçları yeniden yükle
    } catch (error) {
      console.error("Quiz sonucu silinirken hata:", error);
      alert('Quiz sonucu silinirken hata oluştu!');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Giriş kontrolü
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ marginTop: '72px' }}>
        <div className="text-center">
          <div className="loading-spinner mb-4"></div>
          <p className="text-text-secondary">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ marginTop: '72px' }}>
        <LoginPrompt
          title="Kişisel Takip Sayfasına Erişim"
          description="Kişisel gelişiminizi takip etmek ve sınav geçmişinizi incelemek için giriş yapmanız gerekiyor."
          features={[
            "Geçmiş sınav sonuçlarınızı görüntüleme",
            "Detaylı quiz analizi ve performans grafikleri",
            "Gelişim takibi ve istatistikler",
            "Chatbot ile kişisel rehberlik"
          ]}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50" style={{ marginTop: '72px' }}>
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl">📊</span>
            </div>
            <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">
              Kişisel Takip
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {role === 'academician' 
              ? 'Akademisyen özelliklerini kullanın ve öğrenci gelişimlerini takip edin'
              : 'Gelişiminizi takip edin ve performansınızı analiz edin'
            }
          </p>
        </div>

        {/* Quiz Analizi - Sadece öğrenci ve admin için */}
        {(role === 'student' || role === 'admin') && (
          <Card className="mb-8 bg-white/95 backdrop-blur-sm border-2 border-primary-700/30 rounded-3xl shadow-xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg">📈</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Quiz Analizi & Gelişim Takibi
                </h2>
              </div>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {role === 'admin'
                  ? 'Admin olarak kendi sınavlarınızı ve gelişiminizi burada analiz edebilirsiniz.'
                  : 'Gelişiminizi takip edin ve performansınızı analiz edin.'}
              </p>
            </div>

            <QuizAnalysis />
          </Card>
        )}
        
        {/* Geçmiş Sınavlarım */}
        <Card className="bg-white/95 backdrop-blur-sm border-2 border-primary-700/30 rounded-3xl shadow-xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">📝</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                Geçmiş Sınavlarım
              </h2>
            </div>
            <p className="text-gray-600">
              Çözdüğünüz tüm sınavların detaylı sonuçları ve analizleri
            </p>
          </div>
          
          {loadingResults ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-600 font-medium">Sınav sonuçları yükleniyor...</p>
            </div>
          ) : quizResults.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📝</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {role === 'academician' 
                  ? 'Henüz hiç sınav oluşturmamışsınız'
                  : 'Henüz hiç sınav çözmemişsiniz'
                }
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {role === 'academician'
                  ? 'Sınav simülasyonu sayfasından quiz oluşturarak burada sonuçlarını görebilirsiniz.'
                  : 'Sınav simülasyonu sayfasından quiz oluşturup çözerek burada sonuçlarınızı görebilirsiniz.'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {quizResults.map((result) => (
                <div key={result.id} className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200/60 rounded-2xl p-6 hover:shadow-md hover:scale-[1.01] transition-all duration-200">
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer p-4 hover:bg-white/30 rounded-xl transition-all duration-200">
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg ${
                          result.score >= 80 ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                          result.score >= 60 ? 'bg-gradient-to-br from-yellow-500 to-orange-600' :
                          'bg-gradient-to-br from-red-500 to-pink-600'
                        }`}>
                          {result.score}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 mb-1">
                            {result.quizId || 'Quiz Sonucu'}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              {result.score}/{result.totalPoints} puan
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              {formatTime(result.timeSpent)} süre
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                              {formatDate(new Date(result.completedAt).toISOString())}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 group-open:hidden font-medium">Detayları göster</span>
                        <span className="text-sm text-gray-500 hidden group-open:inline font-medium">Gizle</span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteQuizResult(result.id, result.score);
                          }}
                          className="text-red-500 hover:text-red-600 text-sm font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition-all duration-200"
                        >
                          🗑️ Sil
                        </button>
                      </div>
                    </summary>
                    
                    <div className="mt-6 p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60">
                      {result.answers && result.answers.length > 0 ? (
                        <div className="space-y-4">
                          {result.answers.map((answer, index) => {
                            const question = result.questions?.[index];
                            return (
                              <div key={answer.questionId} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200/60 rounded-xl p-4 hover:shadow-sm hover:scale-[1.005] transition-all duration-200">
                                <div className="flex items-start justify-between mb-3">
                                  <span className="font-semibold text-gray-800">
                                    Soru {index + 1}
                                  </span>
                                  <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                                    answer.isCorrect 
                                      ? 'bg-green-100 text-green-700 border-green-200' 
                                      : 'bg-red-100 text-red-700 border-red-200'
                                  }`}>
                                    {answer.isCorrect ? '✅ DOĞRU' : '❌ YANLIŞ'}
                                  </span>
                                </div>
                                
                                <p className="text-gray-700 mb-3 leading-relaxed">
                                  {question?.question || question?.text || 'Soru metni bulunamadı'}
                                </p>
                                
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-600">Sizin cevabınız:</span>
                                    <span className={`px-2 py-1 text-sm font-medium rounded-lg ${
                                      answer.isCorrect 
                                        ? 'bg-green-100 text-green-700' 
                                        : 'bg-red-100 text-red-700'
                                    }`}>
                                      {String(answer.userAnswer)}
                                    </span>
                                  </div>
                                  
                                  {!answer.isCorrect && question?.correctAnswer && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-gray-600">Doğru cevap:</span>
                                      <span className="px-2 py-1 text-sm font-medium bg-green-100 text-green-700 rounded-lg">
                                        {(() => {
                                          if (typeof question.correctAnswer === 'boolean') {
                                            return question.correctAnswer ? 'Doğru' : 'Yanlış';
                                          }
                                          return String(question.correctAnswer);
                                        })()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Açıklama */}
                                {question?.explanation && (
                                  <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200/60">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-blue-600">💡</span>
                                      <span className="font-semibold text-blue-800">Açıklama:</span>
                                    </div>
                                    <p className="text-blue-700 leading-relaxed">{question.explanation}</p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">📝</span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">Bu quiz eski formatta kaydedilmiş</h3>
                          <p className="text-gray-600">Yeni quiz çözerek detaylı raporları görebilirsiniz.</p>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default KisiselTakipPage; 