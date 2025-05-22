'use client';
import "../globals.css";
import Link from "next/link";
import { FaHome, FaDumbbell, FaEnvelope, FaSignOutAlt, FaUserFriends } from "react-icons/fa";
import { AuthProvider } from "../context/AuthContext";
import { useState } from "react";
import FriendsModal from "./components/FriendsModal";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isFriendsModalOpen, setIsFriendsModalOpen] = useState(false);

  // Data structure to hold navigation names and links
  const navItems = [
    { name: "Home", link: "/dashboard", icon: <FaHome /> },
    // { name: "Feed", link: "/dashboard/feed", icon: <FaRss /> },
    { name: "Workouts", link: "/dashboard/workouts", icon: <FaDumbbell /> },
    { name: "Exercises", link: "/dashboard/exercises", icon: <FaDumbbell /> },
    // { name: "Calendar", link: "/dashboard/calendar", icon: <FaCalendarAlt /> },
    // { name: "Coaching", link: "/dashboard/coaching", icon: <FaChalkboardTeacher /> },
    { name: "Messages", link: "/dashboard/messages", icon: <FaEnvelope /> },
    { name: "Logout", link: "/", icon: <FaSignOutAlt /> },
  ];

  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-900">
        <header className="sticky top-0 bg-slate-800 shadow-md p-4 flex text-2xl justify-between items-center text-white border-b border-slate-700">
          <span className="font-bold text-blue-500">Fitness Hub</span>
          <button
            onClick={() => setIsFriendsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-300"
          >
            <FaUserFriends />
            <span>Friends</span>
          </button>
        </header>
        <div className="flex flex-row">
          <aside className="w-64 bg-slate-800 p-4 min-h-screen text-lg border-r border-slate-700">
            <nav className="flex flex-col space-y-2">
              <ul>
                {navItems.map((item) => (
                  <li key={item.name}>
                    <Link 
                      href={item.link} 
                      className="block p-3 flex items-center space-x-3 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors duration-300"
                    >
                      <span className="text-blue-500">{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
          <main className="flex-1 p-6 min-h-screen bg-slate-900">
            {children}
          </main>
        </div>
        <FriendsModal 
          isOpen={isFriendsModalOpen} 
          onClose={() => setIsFriendsModalOpen(false)} 
        />
      </div>
    </AuthProvider>
  );
}
