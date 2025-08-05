'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function ContactPage() {
  const developers = [
    {
      id: 1,
      name: 'Berkay Demircanlı',
      role: 'AI Developer',
      photo: '/images/bekojpeg.jpeg',
      linkedin: 'https://www.linkedin.com/in/berkay-demircanlı-65243b292',
      github: 'https://github.com/berkyyd',
      email: 'bdemircanli15@gmail.com',
      description: 'BANÜ Yönetim Bilişim Sistemleri 3. Sınıf Öğrencisi'
    },
    {
      id: 2,
      name: 'Cenker Gültekin',
      role: 'AI Developer',
      photo: '/images/cenker.jpeg',
      linkedin: 'https://www.linkedin.com/in/cenkergultekin',
      github: 'https://github.com/cenkergultekin',
      email: 'cenkergultekin0@gmail.com',
      description: 'BANÜ Yönetim Bilişim Sistemleri 3. Sınıf Öğrencisi'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 pt-24">
      <div className="max-w-container mx-auto px-md lg:px-xl py-xl">
        {/* Header */}
        <div className="text-center mb-xl">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-md">
            İletişim
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            YBS Buddy projesini geliştiren ekibimizle tanışın. Sorularınız için bizimle iletişime geçebilirsiniz.
          </p>
        </div>

        {/* Developer Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
          {developers.map((developer) => (
            <div key={developer.id} className="group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-500 hover:bg-white/90">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Card Header */}
              <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-xl">
                <div className="flex items-center space-x-lg">
                  {/* Profile Photo */}
                  <div className="relative">
                    <div className="w-28 h-28 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/30 group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                      {/* Profile Image */}
                      <Image
                        src={developer.photo}
                        alt={`${developer.name} profile photo`}
                        width={96}
                        height={96}
                        className="w-24 h-24 rounded-xl object-cover"
                        onError={(e) => {
                          // Fallback to initials if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      {/* Fallback Initials */}
                      <div className="w-24 h-24 bg-gradient-to-br from-white/40 to-white/20 rounded-xl flex items-center justify-center hidden">
                        <span className="text-4xl font-bold text-white">
                          {developer.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    </div>
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                  </div>
                  
                  {/* Name and Role */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-sm group-hover:text-white/90 transition-colors duration-300">
                      {developer.name}
                    </h3>
                    <p className="text-blue-100 font-medium text-lg">
                      {developer.role}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="relative p-xl">
                <p className="text-gray-700 mb-xl leading-relaxed text-lg font-medium">
                  {developer.description}
                </p>

                {/* Contact Links */}
                <div className="space-y-md">
                  {/* LinkedIn */}
                  <Link 
                    href={developer.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-md p-md bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-2xl transition-all duration-300 group/link border border-blue-200/50 hover:border-blue-300/50 hover:shadow-lg"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover/link:scale-110 transition-transform duration-300">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-blue-700 group-hover/link:text-blue-800 text-lg">
                        LinkedIn
                      </p>
                      <p className="text-sm text-blue-600">
                        Profesyonel profil
                      </p>
                    </div>
                  </Link>

                  {/* GitHub */}
                  <Link 
                    href={developer.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-md p-md bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-2xl transition-all duration-300 group/link border border-gray-200/50 hover:border-gray-300/50 hover:shadow-lg"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center shadow-md group-hover/link:scale-110 transition-transform duration-300">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-gray-700 group-hover/link:text-gray-800 text-lg">
                        GitHub
                      </p>
                      <p className="text-sm text-gray-600">
                        Kod projeleri
                      </p>
                    </div>
                  </Link>

                  {/* Email */}
                  <div className="flex items-center space-x-md p-md bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-2xl transition-all duration-300 group/link border border-green-200/50 hover:border-green-300/50 hover:shadow-lg cursor-pointer">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md group-hover/link:scale-110 transition-transform duration-300">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-green-700 group-hover/link:text-green-800 text-lg">
                        E-posta
                      </p>
                      <p className="text-sm text-green-600">
                        {developer.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 