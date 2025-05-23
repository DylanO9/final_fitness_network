'use client';
import { useState, useEffect } from "react";
import CreateWorkoutModal from "../..//components/createWorkoutModal";
import EditWorkoutModal from "@/app/components/editWorkoutModal";
import { motion } from 'framer-motion';

interface Workout {
    workout_id: number;
    user_id: number;
    workout_name: string;
    workout_category: string;
}

export default function Workouts () {
    const [creatingWorkout, setCreatingWorkout] = useState(false)
    const [edittingWorkout, setEditingWorkout] = useState(false)
    const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
    const [workouts, setWorkouts] = useState<Workout []>([]);

    useEffect(() => {
        // Fetch the list of workouts from the server
        const fetchWorkouts = async () => {
            try {
                const response = await fetch('https://fitness-network-backend-lcuf.onrender.com/api/workouts', 
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        },
                    }
                );
                console.log(localStorage.getItem('token'));
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setWorkouts(data);
            } catch (error) {
                console.error("Error fetching workouts:", error);
            }
        };
        fetchWorkouts();
    }, [creatingWorkout]);

    const handleDeleteWorkout = async (workout_id: number) => {
        try {
            const response = await fetch(`https://fitness-network-backend-lcuf.onrender.com/api/workouts/${workout_id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            setWorkouts(workouts.filter((workout: Workout) => workout.workout_id !== workout_id));
        } catch (error) {
            console.error("Error deleting workout:", error);
        }
    };

    return (
        <div className="w-full">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center mb-6"
            >
                <h1 className="text-3xl font-bold text-white">Workouts</h1>
                <button 
                    onClick={() => setCreatingWorkout(true)} 
                    className="bg-blue-600 text-white rounded-lg py-2 px-6 cursor-pointer font-semibold hover:bg-blue-700 transition-colors duration-300"
                >
                    Create Workout
                </button>
            </motion.div>
            
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <input 
                    type="text" 
                    placeholder="Search for workouts" 
                    className="border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-blue-500 rounded-lg p-3 w-full transition-colors duration-300" 
                />
            </motion.div>

            <motion.ul 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6"
            >
                {workouts.map((workout: Workout, index) => (
                    <motion.li 
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg flex flex-col justify-between"
                    >
                        <div>
                            <h2 className="font-semibold text-xl text-white mb-2">{workout.workout_name}</h2>
                            <p className="text-slate-300">{workout.workout_category}</p>
                        </div>
                        <div className="flex justify-end mt-6 space-x-3">
                            <button 
                                onClick={() => handleDeleteWorkout(workout.workout_id)} 
                                className="bg-red-500 text-white rounded-lg py-2 px-4 cursor-pointer font-semibold hover:bg-red-600 transition-colors duration-300"
                            >
                                Delete
                            </button>
                            <button 
                                onClick={() => {setEditingWorkout(true); setSelectedWorkout(workout)}} 
                                className="bg-blue-600 text-white rounded-lg py-2 px-4 cursor-pointer font-semibold hover:bg-blue-700 transition-colors duration-300"
                            >
                                Edit
                            </button>
                        </div>
                    </motion.li>
                ))}
            </motion.ul>

            {creatingWorkout && (
                <CreateWorkoutModal setWorkouts={setWorkouts} setCreatingWorkout={setCreatingWorkout}/>
            )}

            {edittingWorkout && selectedWorkout && (
                <EditWorkoutModal editingExercise={edittingWorkout} setEditingExercise={setEditingWorkout} workout={selectedWorkout}/>
            )}
        </div>
    )
}