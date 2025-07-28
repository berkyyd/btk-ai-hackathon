'use client';
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { QuizResult, Answer } from "../../types/quiz";
import { geminiService } from '../../utils/geminiService';
import Card from '../../components/Card';
import { apiClient } from '../../utils/apiClient';

const ProfilePage = () => {
  const { user, role, loading } = useAuth();
  const [allUsers, setAllUsers] = useState<any[]>([]);

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
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [loadingResults, setLoadingResults] = useState(true);
  const [explanations, setExplanations] = useState<{ [answerId: string]: string }>({});

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

  if (loading || loadingResults) return <div>Yükleniyor...</div>;
  if (!user) return <div>Lütfen giriş yapınız.</div>;

  return (
    <div className='py-8'>
      <section className='text-center mb-16 animate-fadeIn'>
        <h1 className='text-5xl font-extrabold text-text leading-tight mb-4'>
          Profilim
        </h1>
        <p className='text-lg text-text-light max-w-3xl mx-auto leading-relaxed'>
          Geçmiş quiz sonuçlarınızı ve profil bilgilerinizi buradan görüntüleyebilirsiniz.
        </p>
      </section>

      <Card>
        <h2 className="text-3xl font-bold text-text mb-6 text-center border-b-2 border-primary pb-3">
          Profil Bilgileri
        </h2>
        <div className="text-center">
          <p><strong>Ad Soyad:</strong> {user.displayName}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Rol:</strong> {role}</p>
        </div>
      </Card>

      <Card className="mt-8">
        <h2 className="text-3xl font-bold text-text mb-6 text-center border-b-2 border-primary pb-3">
          Geçmiş Sınavlarım
        </h2>
        {quizResults.length === 0 ? (
          <div className='text-center py-8'>
            <p className='text-text-light'>Henüz quiz çözmediniz.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {quizResults.map((result) => (
              <div key={result.id} className="border rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-xl text-primary">Quiz ID: {result.quizId}</span>
                  <span className="text-sm text-gray-500">Tarih: {new Date(result.completedAt).toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{result.score}</div>
                        <div className="text-sm text-gray-600">Puan</div>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{result.answers.filter(a => a.isCorrect).length}</div>
                        <div className="text-sm text-gray-600">Doğru</div>
                    </div>
                    <div className="p-2 bg-red-100 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{result.answers.filter(a => !a.isCorrect).length}</div>
                        <div className="text-sm text-gray-600">Yanlış</div>
                    </div>
                    <div className="p-2 bg-yellow-100 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{result.timeSpent} sn</div>
                        <div className="text-sm text-gray-600">Süre</div>
                    </div>
                </div>
                <details className="mt-2">
                  <summary className="cursor-pointer text-blue-600 hover:underline">Detaylı Rapor</summary>
                  <ul className="mt-4 space-y-4">
                    {result.answers.map((ans: Answer, idx: number) => (
                      <li key={ans.questionId} className={`p-3 rounded-lg ${ans.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                        <div className="font-semibold"><b>{idx + 1}. Soru:</b> {result.questions?.find(q => q.id === ans.questionId)?.question || ans.questionId}</div>
                        <div className="mt-1"><b>Cevabınız:</b> {String(ans.userAnswer)}</div>
                        {!ans.isCorrect && (
                          <div className="mt-1"><b>Doğru Cevap:</b> {String(result.questions?.find(q => q.id === ans.questionId)?.correctAnswer)}</div>
                        )}
                        <div className={`mt-2 font-bold ${ans.isCorrect ? 'text-green-700' : 'text-red-700'}`}>{ans.isCorrect ? "DOĞRU ✅" : "YANLIŞ ❌"}</div>
                        {!ans.isCorrect && (
                          <div className="mt-2 text-sm text-gray-600">
                            <b>Açıklama:</b> <i>{result.questions?.find(q => q.id === ans.questionId)?.explanation || 'Açıklama mevcut değil.'}</i>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProfilePage;