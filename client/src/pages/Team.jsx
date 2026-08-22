import React from 'react';

const team = [
  { name: 'sabo-gla', role: 'Digital', avatarUrl: 'https://api.dicebear.com/7.x/thumbs/svg?seed=2' },
  { name: 'aben-cad', role: 'Backend', avatarUrl: 'https://api.dicebear.com/7.x/thumbs/svg?seed=1' },
  { name: 'spostica', role: 'Digital', avatarUrl: 'https://api.dicebear.com/7.x/thumbs/svg?seed=3' },
  { name: 'ameine', role: 'Data', avatarUrl: 'https://api.dicebear.com/7.x/thumbs/svg?seed=4' },
  { name: 'rreimann', role: 'Data', avatarUrl: 'https://api.dicebear.com/7.x/thumbs/svg?seed=5' },
  { name: 'ekypraio', role: 'Data', avatarUrl: 'https://api.dicebear.com/7.x/thumbs/svg?seed=6' },
];

export default function Team() {
  return (
    <div className="text-center max-w-5xl mx-auto py-4 animate-fadeIn">
      <h2 className="text-3xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
        Meet the Team
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
        Crafted by students for students to elevate the 42 Heilbronn experience.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 mt-8">
        {team.map((member, idx) => (
          <div 
            key={member.name} 
            className="group p-5 rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/40 dark:border-gray-800 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
          >
            <div className="flex flex-col items-center text-center animate-float-slow" style={{ animationDelay: `${idx * 0.15}s` }}>
              <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-gray-800 shadow-md group-hover:scale-105 transition-transform duration-300">
                <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
              </div>
              <div className="mt-3.5 font-bold text-gray-900 dark:text-gray-100 text-sm">{member.name}</div>
              <div className="text-xs font-semibold text-blue-600 dark:text-cyan-400 mt-0.5">{member.role}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
