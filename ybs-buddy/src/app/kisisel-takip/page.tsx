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
          <div className="loading-spinner mb-4"></div>
          <p className="text-text-secondary">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
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
    );
  }

  return (
    <div className="min-h-screen max-w-6xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-text-primary mb-2">Kişisel Takip</h1>
        <p className="text-text-secondary">
          {role === 'academician' 
            ? 'Akademisyen özelliklerini kullanın'
            : 'Gelişiminizi takip edin ve performansınızı analiz edin'
          }
        </p>
      </div>

      {/* Quiz Analizi - Sadece öğrenci ve admin için */}
      {(role === 'student' || role === 'admin') && (
        <Card className="mb-8">
          <h2 className="text-3xl font-bold text-text-primary mb-6 text-center border-b-2 border-primary-500 pb-3">
            📊 Quiz Analizi & Gelişim Takibi
          </h2>
          <p className="text-center text-text-secondary mb-4">
            {role === 'admin'
              ? 'Admin olarak kendi sınavlarınızı ve gelişiminizi burada analiz edebilirsiniz.'
              : 'Gelişiminizi takip edin ve performansınızı analiz edin.'}
          </p>
          <QuizAnalysis />
        </Card>
      )}
      
      {/* Akademisyenler için bilgi mesajı */}
      {/* role === 'academician' && (
        <Card className="mb-8">
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎓</div>
            <h2 className="text-2xl font-bold text-text-primary mb-4">Akademisyen Paneli</h2>
            <p className="text-text-secondary mb-4">
              Bu sayfa öğrenciler için tasarlanmıştır. Akademisyenler için gelişim takibi analizi mevcut değildir.
            </p>
            <div className="bg-primary-900/20 border border-primary-700/30 rounded-lg p-4 max-w-md mx-auto">
              <h3 className="font-semibold text-primary-300 mb-2">Akademisyen Özellikleri:</h3>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>• Ders notları oluşturma ve paylaşma</li>
                <li>• Quiz oluşturma ve yönetme</li>
              </ul>
            </div>
          </div>
        </Card>
      ) */}

      {/* Geçmiş Sınavlarım */}
      <Card>
        <h2 className="text-3xl font-bold text-text-primary mb-6 text-center border-b-2 border-primary-500 pb-3">
          📝 Geçmiş Sınavlarım
        </h2>
        
        {loadingResults ? (
          <div className="text-center py-8">
            <div className="loading-spinner mb-4"></div>
            <p className="text-text-secondary">Sınav sonuçları yükleniyor...</p>
          </div>
        ) : quizResults.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-text-secondary mb-2">
              {role === 'academician' 
                ? 'Henüz hiç sınav oluşturmamışsınız.'
                : 'Henüz hiç sınav çözmemişsiniz.'
              }
            </p>
            <p className="text-text-muted text-sm">
              {role === 'academician'
                ? 'Sınav simülasyonu sayfasından quiz oluşturarak burada sonuçlarını görebilirsiniz.'
                : 'Sınav simülasyonu sayfasından quiz oluşturup çözerek burada sonuçlarınızı görebilirsiniz.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {quizResults.map((result) => (
              <div key={result.id} className="card-glass border border-primary-700/30 rounded-lg p-4 hover:shadow-glow-blue transition-all duration-400">
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer p-2 hover:bg-primary-900/20 rounded transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold border ${
                        result.score >= 80 ? 'bg-green-600 border-green-500/30' :
                        result.score >= 60 ? 'bg-yellow-600 border-yellow-500/30' :
                        'bg-red-600 border-red-500/30'
                      }`}>
                        {result.score}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-text-primary">
                          {result.quizId || 'Quiz Sonucu'}
                        </h3>
                        <p className="text-sm text-text-secondary">
                          {result.score}/{result.totalPoints} puan • 
                          {formatTime(result.timeSpent)} süre • 
                          {formatDate(new Date(result.completedAt).toISOString())}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-text-muted group-open:hidden">Detayları göster</span>
                      <span className="text-sm text-text-muted hidden group-open:inline">Gizle</span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteQuizResult(result.id, result.score);
                        }}
                        className="text-red-400 hover:text-red-300 text-sm font-medium ml-4 transition-colors"
                      >
                        🗑️ Sil
                      </button>
                    </div>
                  </summary>
                  
                  <div className="mt-4 p-4 bg-primary-900/10 rounded-lg border border-primary-700/30">
                    {result.answers && result.answers.length > 0 ? (
                      result.answers.map((answer, index) => {
                        const question = result.questions?.[index];
                        return (
                          <div key={answer.questionId} className="mb-4 p-3 bg-card-light rounded border border-primary-700/30">
                            <div className="flex items-start justify-between mb-2">
                              <span className="font-medium text-text-primary">
                                Soru {index + 1}:
                              </span>
                              <span className={`px-2 py-1 text-xs font-semibold rounded border ${
                                answer.isCorrect ? 'bg-green-900/30 text-green-300 border-green-700/30' : 'bg-red-900/30 text-red-300 border-red-700/30'
                              }`}>
                                {answer.isCorrect ? 'DOĞRU' : 'YANLIŞ'}
                              </span>
                            </div>
                            
                            <p className="text-text-secondary mb-2">{question?.question || question?.text || 'Soru metni bulunamadı'}</p>
                            
                            <div className="space-y-1">
                              <div className="text-sm">
                                <span className="font-medium text-text-secondary">Sizin cevabınız:</span>
                                <span className={`ml-2 ${
                                  answer.isCorrect ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  {String(answer.userAnswer)}
                                </span>
                              </div>
                              
                              {!answer.isCorrect && question?.correctAnswer && (
                                <div className="text-sm">
                                  <span className="font-medium text-text-secondary">Doğru cevap:</span>
                                  <span className="ml-2 text-green-400">
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
                              <div className="mt-3 p-3 bg-primary-900/20 rounded-lg border border-primary-700/30">
                                <span className="font-medium text-primary-300">Açıklama:</span>
                                <p className="text-primary-200 mt-1 italic">{question.explanation}</p>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-4">📝</div>
                        <p className="text-text-secondary mb-2">Bu quiz eski formatta kaydedilmiş.</p>
                        <p className="text-text-muted text-sm">Yeni quiz çözerek detaylı raporları görebilirsiniz.</p>
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