// app/(dashboard)/ceo/layout.jsx
import Sidebar from '../../Components/layouts/Sidebar';

export const metadata = {
     title: "CEO Dashboard - Meetech",
     description: "CEO project management dashboard",
};

export default function CEOLayout({ children }) {
     return (
          <div className="min-h-screen bg-bg-page text-text-body font-sans flex">
               {/* 1. Sidebar stays static here */}
               <Sidebar userRole="CEO" />

               {/* 2. Right side container */}
               <main className="flex-1 flex flex-col min-w-0">
                    {/* The children represents the specific page (dashboard, settings, etc.) */}
                    {children}
               </main>
          </div>
     );
}