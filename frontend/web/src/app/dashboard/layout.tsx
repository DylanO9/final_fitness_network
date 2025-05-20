import "../globals.css";
import Link from "next/link";
import { FaHome, FaRss, FaDumbbell, FaCalendarAlt, FaChalkboardTeacher, FaEnvelope, FaSignOutAlt } from "react-icons/fa";
import { AuthProvider } from "../context/AuthContext";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  // Data structure to hold navigation names and links
  const navItems = [
    { name: "Home", link: "/dashboard", icon: <FaHome /> },
    { name: "Feed", link: "/dashboard/feed", icon: <FaRss /> },
    { name: "Workouts", link: "/dashboard/workouts", icon: <FaDumbbell /> },
    { name: "Exercises", link: "/dashboard/exercises", icon: <FaDumbbell /> },
    { name: "Calendar", link: "/dashboard/calendar", icon: <FaCalendarAlt /> },
    { name: "Coaching", link: "/dashboard/coaching", icon: <FaChalkboardTeacher /> },
    { name: "Messages", link: "/dashboard/messages", icon: <FaEnvelope /> },
    { name: "Logout", link: "/", icon: <FaSignOutAlt /> },
  ];
  return (
    <AuthProvider>
    <header className="sticky top-0 bg-white shadow-md p-4 flex text-2xl justify-between items-center">
      Fitness Hub
    </header>
    <div className="flex flex-row">
      <aside className="w-1/5 bg-white p-4 min-h-screen text-lg">
        <nav className="flex flex-col space-y-2">
          <ul>
            {navItems.map((item) => (
                <li key={item.name} className="hover:bg-gray-200 rounded">
                  <Link href={item.link} className="block p-2 flex items-center space-x-2">
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                  </Link>
                </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="w-4/5 p-4 min-h-screen">
        {children}
      </main>
    </div>
    </AuthProvider>
  );
}
