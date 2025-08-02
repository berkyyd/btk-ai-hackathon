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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginPrompt
        title="Kişisel Takip Sayfasına Erişim"
        message="Kişisel gelişiminizi takip etmek ve sınav geçmişinizi incelemek için giriş yapmanız gerekiyor."
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Kişisel Takip</h1>
        <p className="text-gray-600">Gelişiminizi takip edin ve performansınızı analiz edin</p>
      </div>

      {/* Quiz Analizi */}
      <Card className="mb-8">
        <h2 className="text-3xl font-bold text-text mb-6 text-center border-b-2 border-primary pb-3">
          📊 Quiz Analizi & Gelişim Takibi
        </h2>
        <QuizAnalysis />
      </Card>

      {/* Geçmiş Sınavlarım */}
      <Card>
        <h2 className="text-3xl font-bold text-text mb-6 text-center border-b-2 border-primary pb-3">
          📝 Geçmiş Sınavlarım
        </h2>
        
        {loadingResults ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Sınav sonuçları yükleniyor...</p>
          </div>
        ) : quizResults.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-gray-600 mb-2">Henüz hiç sınav çözmemişsiniz.</p>
            <p className="text-gray-500 text-sm">Sınav simülasyonu sayfasından quiz oluşturup çözerek burada sonuçlarınızı görebilirsiniz.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {quizResults.map((result) => (
              <div key={result.id} className="border border-purple-200 rounded-lg p-4 hover:shadow-lg transition-shadow bg-gray-100">
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer p-2 hover:bg-purple-100 rounded">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                        result.score >= 80 ? 'bg-green-500' :
                        result.score >= 60 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}>
                        {result.score}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {result.quizId || 'Quiz Sonucu'}
                        </h3>
                        <p className="text-sm text-gray-700 font-medium">
                          {result.score}/{result.totalPoints} puan • 
                          {formatTime(result.timeSpent)} süre • 
                          {formatDate(new Date(result.completedAt).toISOString())}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-700 font-medium group-open:hidden">Detayları göster</span>
                      <span className="text-sm text-gray-700 font-medium hidden group-open:inline">Gizle</span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteQuizResult(result.id, result.score);
                        }}
                        className="text-red-600 hover:text-red-800 text-sm font-medium ml-4"
                      >
                        🗑️ Sil
                      </button>
                    </div>
                  </summary>
                  
                  <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    {result.answers && result.answers.length > 0 ? (
                      result.answers.map((answer, index) => {
                        // Soru bilgisini answer.questionId ile bul, bulamazsa index ile dene
                        let question = result.questions?.find(q => q.id === answer.questionId);
                        if (!question && result.questions && result.questions[index]) {
                          question = result.questions[index];
                        }
                        return (
                          <div key={answer.questionId} className="mb-4 p-3 bg-white rounded border border-purple-200 shadow-sm">
                            <div className="flex items-start justify-between mb-2">
                              <span className="font-semibold text-gray-900">
                                Soru {index + 1}:
                              </span>
                              <span className={`px-2 py-1 text-xs font-bold rounded ${
                                answer.isCorrect ? 'bg-green-200 text-green-900' : 'bg-red-200 text-red-900'
                              }`}>
                                {answer.isCorrect ? 'DOĞRU' : 'YANLIŞ'}
                              </span>
                            </div>
                            
                            <p className="text-gray-900 mb-2 font-medium">
                              {question?.text || 
                               question?.question ||
                               (result.questions && result.questions[index]?.text) || 
                               (result.questions && result.questions[index]?.question) ||
                               'Soru metni bulunamadı'}
                            </p>
                            
                            <div className="space-y-1">
                              <div className="text-sm">
                                <span className="font-semibold text-gray-900">Sizin cevabınız:</span>
                                <span className={`ml-2 font-medium ${
                                  answer.isCorrect ? 'text-green-800' : 'text-red-800'
                                }`}>
                                  {String(answer.userAnswer)}
                                </span>
                              </div>
                              
                              {!answer.isCorrect && (
                                <div className="text-sm">
                                  <span className="font-semibold text-gray-900">Doğru cevap:</span>
                                  <span className="ml-2 text-green-800 font-medium">
                                    {(() => {
                                      const correctAnswer = question?.correctAnswer || 
                                                           (result.questions && result.questions[index]?.correctAnswer) ||
                                                           answer.correctAnswer;
                                      if (typeof correctAnswer === 'boolean') {
                                        return correctAnswer ? 'Doğru' : 'Yanlış';
                                      }
                                      return String(correctAnswer);
                                    })()}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {/* Açıklama */}
                            {(question?.explanation || (result.questions && result.questions[index]?.explanation)) && (
                              <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                                <span className="font-medium text-purple-700">Açıklama:</span>
                                <p className="text-purple-600 mt-1 italic">
                                  {question?.explanation || (result.questions && result.questions[index]?.explanation)}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-4">📝</div>
                        <p className="text-gray-600 mb-2">Bu quiz eski formatta kaydedilmiş.</p>
                        <p className="text-gray-500 text-sm">Yeni quiz çözerek detaylı raporları görebilirsiniz.</p>
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
  );
};

export default KisiselTakipPage; 