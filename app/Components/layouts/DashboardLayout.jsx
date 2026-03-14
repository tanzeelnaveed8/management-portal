
// components/layouts/DashboardLayout.js
'use client';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function DashboardLayout({ children, userRole }) {
     const [isSidebarOpen, setIsSidebarOpen] = useState(true);

     return (
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
               <Sidebar userRole={userRole} />
               <div className={`transition-all ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                    <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                    <main className="p-6">
                         {children}
                    </main>
               </div>
          </div>
     );
}