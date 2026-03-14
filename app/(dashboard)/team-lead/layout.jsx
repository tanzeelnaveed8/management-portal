
// app/(dashboard)/team-lead/layout.jsx
import Sidebar from '../../Components/layouts/Sidebar';

export const metadata = {
     title: "Team Lead Dashboard - MeetTech",
     description: "Team lead project management dashboard",
};

export default function TeamLeadLayout({ children }) {
     return (
          <div className="min-h-screen bg-bg-page text-text-body font-sans flex">
               {/* 1. Sidebar stays static here */}
               <Sidebar userRole="TEAM_LEAD" />

               {/* 2. Right side container */}
               <main className="flex-1 flex flex-col min-w-0">
                    {/* The children represents the specific page (dashboard, settings, etc.) */}
                    {children}
               </main>
          </div>
     );
}