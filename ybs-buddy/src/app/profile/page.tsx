'use client';
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { collection, getDocs, query, where, doc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { QuizResult, Answer } from "../../types/quiz";
import { geminiService } from '../../utils/geminiService';
import Card from '../../components/Card';
import { apiClient } from '../../utils/apiClient';
import { createInvitationCode } from '../../utils/invitationCodeService';
import SummarizedNotesList from '../../components/SummarizedNotesList';

const ProfilePage = () => {
  const { user, role, loading } = useAuth();
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [newInvitationCode, setNewInvitationCode] = useState<string>('');
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [loadingResults, setLoadingResults] = useState(true);
  const [explanations, setExplanations] = useState<{ [answerId: string]: string }>({});

  useEffect(() => {
    if (role === 'admin') {
      const fetchUsers = async () => {
        const usersCollection = await getDocs(collection(db, 'users'));
        setAllUsers(usersCollection.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      };
      fetchUsers();
    }
  }, [role]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    const userDoc = doc(db, 'users', userId);
    await updateDoc(userDoc, { role: newRole });
    setAllUsers(allUsers.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  const generateInvitationCode = async (targetRole: 'academician' | 'student' = 'student') => {
    const result = await createInvitationCode(targetRole);
    if (result.success && result.code) {
      setNewInvitationCode(result.code);
      const roleText = targetRole === 'academician' ? 'Akademisyen' : 'Öğrenci';
      alert(`${roleText} davet kodu oluşturuldu: ${result.code}`);
    } else {
      alert(`Davet kodu oluşturulamadı: ${result.error}`);
    }
  };

  useEffect(() => {
    if (!user) return;
    const fetchResults = async () => {
      setLoadingResults(true);
      const resultsRef = collection(db, "quizResults");
      const q = query(resultsRef, where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      const results: QuizResult[] = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as QuizResult[];
      setQuizResults(results);
      setLoadingResults(false);
    };
    fetchResults();
  }, [user]);

  useEffect(() => {
    if (!user || quizResults.length === 0) return;
    const fetchExplanations = async () => {
      const newExplanations: { [answerId: string]: string } = {};
      for (const result of quizResults) {
        const questionsMap = (result.questions || []).reduce((acc: { [key: string]: any }, q: any) => {
          acc[q.id] = q;
          return acc;
        }, {});
        for (const ans of result.answers) {
          if (!ans.isCorrect) {
            const q = questionsMap[ans.questionId];
            if (q && q.text && q.correctAnswer) {
              const key = `${result.id}_${ans.questionId}`;
              if (!explanations[key]) {
                if (q.explanation) {
                  newExplanations[key] = q.explanation.trim() === '' ? 'Açıklama mevcut değil.' : q.explanation;
                } else {
                  newExplanations[key] = 'Açıklama mevcut değil.';
                }
              }
            }
          }
        }
      }
      setExplanations(prev => ({ ...prev, ...newExplanations }));
    };
    fetchExplanations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, quizResults]);

  if (loading || loadingResults) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-text-light">Yükleniyor...</p>
      </div>
    </div>
  );
  
  if (!user) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-text mb-4">Giriş Gerekli</h2>
        <p className="text-text-light">Profil bilgilerinizi görüntülemek için lütfen giriş yapınız.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <section className='text-center mb-16 animate-fadeIn'>
          <h1 className='text-5xl font-extrabold text-text leading-tight mb-4'>
            Profilim
          </h1>
          <p className='text-lg text-text-light max-w-3xl mx-auto leading-relaxed'>
            Geçmiş quiz sonuçlarınızı ve profil bilgilerinizi buradan görüntüleyebilirsiniz.
          </p>
        </section>

        {/* Profil Bilgileri */}
        <Card className="mb-8">
          <h2 className="text-3xl font-bold text-text mb-6 text-center border-b-2 border-primary pb-3">
            Profil Bilgileri
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-text">{user.displayName || 'İsimsiz Kullanıcı'}</h3>
                  <p className="text-text-light">{user.email}</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-text">Rol:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  role === 'admin' ? 'bg-red-100 text-red-800' :
                  role === 'academician' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {role === 'admin' ? '👑 Admin' :
                   role === 'academician' ? '🎓 Akademisyen' :
                   '👨‍🎓 Öğrenci'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-text">Toplam Quiz:</span>
                <span className="text-lg font-bold text-primary">{quizResults.length}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Admin Davet Kodu Yönetimi */}
        {role === 'admin' && (
          <Card className="mb-8">
            <h2 className="text-3xl font-bold text-text mb-6 text-center border-b-2 border-primary pb-3">
              Davet Kodu Yönetimi
            </h2>
            <div className="text-center space-y-6">
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() => generateInvitationCode('student')}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  👨‍🎓 Öğrenci Davet Kodu Oluştur
                </button>
                <button
                  onClick={() => generateInvitationCode('academician')}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  🎓 Akademisyen Davet Kodu Oluştur
                </button>
              </div>
              {newInvitationCode && (
                <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-lg">
                  <p className="text-xl font-semibold text-green-700 mb-2">
                    ✅ Davet Kodu Oluşturuldu!
                  </p>
                  <p className="text-lg font-mono bg-green-100 px-4 py-2 rounded-lg border-2 border-green-300 text-green-800">
                    {newInvitationCode}
                  </p>
                  <p className="text-sm text-green-600 mt-3">
                    Bu kod ile kayıt olan kullanıcılar otomatik olarak belirlenen role sahip olacak.
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Geçmiş Sınavlarım */}
        <Card className="mb-8">
          <h2 className="text-3xl font-bold text-text mb-6 text-center border-b-2 border-primary pb-3">
            Geçmiş Sınavlarım
          </h2>
          {quizResults.length === 0 ? (
            <div className='text-center py-12'>
              <div className="text-6xl mb-4">📝</div>
              <p className='text-text-light text-lg'>Henüz quiz çözmediniz.</p>
              <p className='text-text-light text-sm mt-2'>Sınav simülasyonu sayfasından quiz çözebilirsiniz.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {quizResults.map((result) => (
                <div key={result.id} className="border-2 border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div>
                      <span className="font-bold text-xl text-primary">Quiz #{result.quizId}</span>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(result.completedAt).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                        result.score >= 80 ? 'bg-green-100 text-green-800' :
                        result.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {result.score} Puan
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-blue-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">{result.score}</div>
                      <div className="text-sm text-gray-600">Puan</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">{result.answers.filter(a => a.isCorrect).length}</div>
                      <div className="text-sm text-gray-600">Doğru</div>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-red-600">{result.answers.filter(a => !a.isCorrect).length}</div>
                      <div className="text-sm text-gray-600">Yanlış</div>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-yellow-600">{Math.floor(result.timeSpent / 60)}:{String(result.timeSpent % 60).padStart(2, '0')}</div>
                      <div className="text-sm text-gray-600">Süre</div>
                    </div>
                  </div>
                  
                  <details className="mt-4">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-semibold text-lg flex items-center space-x-2">
                      <span>📋 Detaylı Rapor</span>
                      <span className="text-sm">({result.answers.length} soru)</span>
                    </summary>
                    <div className="mt-6 space-y-4">
                                             {result.questions && result.questions.length > 0 ? (
                        // Yeni format - soru metinleri mevcut
                        result.answers.map((ans: Answer, idx: number) => {
                          const question = result.questions?.find(q => q.id === ans.questionId);
                          const questionText = question?.text || `Soru ${idx + 1}`;
                          const questionType = question?.type || 'unknown';
                          const questionOptions = question?.options || [];
                         
                         return (
                           <div key={ans.questionId} className={`p-4 rounded-lg border-2 ${
                             ans.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                           }`}>
                             <div className="flex items-start space-x-3">
                               <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                                 ans.isCorrect ? 'bg-green-500' : 'bg-red-500'
                               }`}>
                                 {idx + 1}
                               </div>
                               <div className="flex-1">
                                 {/* Soru Metni */}
                                 <div className="font-semibold text-text mb-3 text-lg">
                                   {questionText}
                                 </div>
                                 
                                 {/* Seçenekler (Çoktan seçmeli sorular için) */}
                                 {questionType === 'multiple-choice' && questionOptions.length > 0 && (
                                   <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                                     <span className="font-medium text-gray-700 text-sm">Seçenekler:</span>
                                     <div className="mt-2 space-y-1">
                                       {questionOptions.map((option, optionIdx) => (
                                         <div key={optionIdx} className="text-sm text-gray-600">
                                           {String.fromCharCode(65 + optionIdx)}) {option}
                                         </div>
                                       ))}
                                     </div>
                                   </div>
                                 )}
                                 
                                 <div className="space-y-2 text-sm">
                                   <div>
                                     <span className="font-medium text-gray-600">Cevabınız:</span>
                                     <span className={`ml-2 font-semibold ${
                                       ans.isCorrect ? 'text-green-700' : 'text-red-700'
                                     }`}>
                                       {String(ans.userAnswer)}
                                     </span>
                                   </div>
                                   
                                   {/* Doğru Cevap (Her zaman göster) */}
                                   {question?.correctAnswer && (
                                     <div>
                                       <span className="font-medium text-gray-600">Doğru Cevap:</span>
                                       <span className="ml-2 font-semibold text-green-700">
                                         {(() => {
                                           // Çoktan seçmeli sorularda doğru cevabın tam metnini bul
                                           if (questionType === 'multiple-choice' && questionOptions.length > 0) {
                                             const correctAnswer = String(question.correctAnswer);
                                             // Eğer doğru cevap harf ise (A, B, C, D), tam seçenek metnini bul
                                             if (correctAnswer.length === 1 && /^[A-D]$/.test(correctAnswer)) {
                                               const optionIndex = correctAnswer.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
                                               if (questionOptions[optionIndex]) {
                                                 return questionOptions[optionIndex];
                                               }
                                             }
                                             // Eğer doğru cevap zaten tam metin ise, olduğu gibi göster
                                             return correctAnswer;
                                           }
                                           // Diğer durumlarda doğru cevabı olduğu gibi göster
                                           return String(question.correctAnswer);
                                         })()}
                                       </span>
                                     </div>
                                   )}
                                   
                                   <div className={`font-bold text-lg ${
                                     ans.isCorrect ? 'text-green-700' : 'text-red-700'
                                   }`}>
                                     {ans.isCorrect ? "✅ DOĞRU" : "❌ YANLIŞ"}
                                   </div>
                                   
                                   {/* Açıklama */}
                                   {question?.explanation && (
                                     <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                                       <span className="font-medium text-gray-700">Açıklama:</span>
                                       <p className="text-gray-600 mt-1 italic">{question.explanation}</p>
                                     </div>
                                   )}
                                 </div>
                               </div>
                             </div>
                           </div>
                         );
                       })
                      ) : (
                        // Eski format - sadece temel bilgiler
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

        {/* Özetlenmiş Notlarım */}
        <Card>
          <h2 className="text-3xl font-bold text-text mb-6 text-center border-b-2 border-primary pb-3">
            Özetlenmiş Notlarım
          </h2>
          {user && <SummarizedNotesList userId={user.uid} />}
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;