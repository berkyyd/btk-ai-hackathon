import { NextResponse } from 'next/server';
import { db } from '../../../config/firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy, limit, startAfter } from 'firebase/firestore/lite';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '5');
    const roleFilter = searchParams.get('role') || '';
    const searchQuery = searchParams.get('search') || '';

    // Tüm kullanıcıları getir
    const querySnapshot = await getDocs(collection(db, 'users'));
    const users: any[] = [];

    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      users.push({
        id: doc.id,
        displayName: userData.displayName || 'İsimsiz',
        email: userData.email || '',
        role: userData.role || 'student',
        createdAt: userData.createdAt?.toDate?.() || new Date(),
        ...userData
      });
    });

    // Filtreleme ve arama
    let filteredUsers = users;

    // Rol filtresi
    if (roleFilter) {
      filteredUsers = filteredUsers.filter(user => user.role === roleFilter);
    }

    // Arama filtresi
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.displayName?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
      );
    }

    // Sıralama: Yönetici -> Akademisyen -> Öğrenci, sonra alfabetik
    const roleOrder = { admin: 1, academician: 2, student: 3 };
    filteredUsers.sort((a, b) => {
      const roleDiff = (roleOrder[a.role as keyof typeof roleOrder] || 4) - (roleOrder[b.role as keyof typeof roleOrder] || 4);
      if (roleDiff !== 0) return roleDiff;
      return (a.displayName || '').localeCompare(b.displayName || '', 'tr');
    });

    // Sayfalama
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedUsers,
      pagination: {
        currentPage: page,
        pageSize: pageSize,
        totalUsers: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / pageSize)
      }
    });

  } catch (error) {
    console.error('Kullanıcılar yüklenirken hata:', error);
    return NextResponse.json(
      { success: false, error: 'Kullanıcılar yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { userId, role } = await request.json();

    if (!userId || !role) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı ID ve rol gereklidir' },
        { status: 400 }
      );
    }

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role: role,
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'Kullanıcı rolü başarıyla güncellendi'
    });

  } catch (error) {
    console.error('Rol güncelleme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Rol güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
} 