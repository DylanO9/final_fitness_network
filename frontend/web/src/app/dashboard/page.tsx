'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function DashboardPage() {
  // Mock data - replace with real data from your backend
  const stats = {
    workoutsThisWeek: 4,
    totalWorkouts: 32,
    streakDays: 7,
    caloriesBurned: 2500,
  };

  const recentWorkouts = [
    { id: 1, name: 'Upper Body Strength', date: '2024-03-20', duration: '45 min' },
    { id: 2, name: 'HIIT Cardio', date: '2024-03-18', duration: '30 min' },
    { id: 3, name: 'Leg Day', date: '2024-03-15', duration: '60 min' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Welcome back, User!</h1>
        <p className="text-slate-300">Here's your fitness overview</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-slate-800 p-6 rounded-xl border border-slate-700"
        >
          <h3 className="text-slate-300 mb-2">Workouts This Week</h3>
          <p className="text-3xl font-bold text-blue-500">{stats.workoutsThisWeek}</p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-slate-800 p-6 rounded-xl border border-slate-700"
        >
          <h3 className="text-slate-300 mb-2">Total Workouts</h3>
          <p className="text-3xl font-bold text-blue-500">{stats.totalWorkouts}</p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-slate-800 p-6 rounded-xl border border-slate-700"
        >
          <h3 className="text-slate-300 mb-2">Current Streak</h3>
          <p className="text-3xl font-bold text-blue-500">{stats.streakDays} days</p>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-slate-800 p-6 rounded-xl border border-slate-700"
        >
          <h3 className="text-slate-300 mb-2">Calories Burned</h3>
          <p className="text-3xl font-bold text-blue-500">{stats.caloriesBurned}</p>
        </motion.div>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Workouts */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700"
        >
          <h2 className="text-xl font-bold mb-4">Recent Workouts</h2>
          <div className="space-y-4">
            {recentWorkouts.map((workout) => (
              <div key={workout.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors duration-300">
                <div>
                  <h3 className="font-semibold">{workout.name}</h3>
                  <p className="text-slate-300 text-sm">{workout.date}</p>
                </div>
                <span className="text-blue-500">{workout.duration}</span>
              </div>
            ))}
          </div>
          <Link 
            href="/workouts" 
            className="inline-block mt-4 text-blue-500 hover:text-blue-400 transition-colors duration-300"
          >
            View all workouts →
          </Link>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-800 p-6 rounded-xl border border-slate-700"
        >
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <Link 
              href="/workouts/new" 
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg transition-colors duration-300"
            >
              Start New Workout
            </Link>
            <Link 
              href="/progress" 
              className="block w-full bg-slate-700 hover:bg-slate-600 text-white text-center py-3 rounded-lg transition-colors duration-300"
            >
              View Progress
            </Link>
            <Link 
              href="/community" 
              className="block w-full bg-slate-700 hover:bg-slate-600 text-white text-center py-3 rounded-lg transition-colors duration-300"
            >
              Community Feed
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}