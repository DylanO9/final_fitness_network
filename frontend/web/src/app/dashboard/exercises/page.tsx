'use client';

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import EditExerciseModal from "@/app/components/editExerciseModal";
import { motion } from 'framer-motion';

interface Exercise {
    exercise_id: number;
    user_id: number;
    exercise_name: string;
    description: string;
    exercise_category: string;
}

export default function Exercises() {
    const auth = useAuth();
    const user = auth?.user;
    const [exercises, setExercises] = useState<Exercise []>([]);
    const [triggerRefresh, setTriggerRefresh] = useState(false);
    const [editExercise, setEditExercise] = useState<Exercise>();
    const [openEditModal, setOpenEditModal] = useState(false);

    useEffect(() => {
        // Fetch the list of exercises from the server
        const fetchExercises = async () => {
            try {
                const response = await fetch('https://fitness-network-backend-lcuf.onrender.com/api/exercises/all', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                } 
                const data = await response.json();
                setExercises(data);
            } catch (error) {
                console.error("Error fetching exercises:", error);
            }
        };
        fetchExercises();
    }, [triggerRefresh]);

    const handleCreateExercise = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const exercise_name = formData.get('exercise_name') as string;
        const description = formData.get('description') as string;
        const exercise_category = formData.get('exercise_category') as string;
        const exercise = {
            exercise_name,
            description,
            exercise_category
        };

        try {
            console.log("Creating exercise:", JSON.stringify(exercise));
            const response = await fetch('https://fitness-network-backend-lcuf.onrender.com/api/exercises/no-workout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(exercise),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log("Exercise created:", data);
            setTriggerRefresh(!triggerRefresh);
        } catch (error) {
            console.error("Error creating exercise:", error);
        }
    };

    const handleOpenEditModal = (exercise_id: number, exercise_name: string, description: string, exercise_category: string) => {
        setEditExercise({
            exercise_id,
            user_id: user?.user_id ?? 0,
            exercise_name: exercise_name,
            description: description ?? "",
            exercise_category: exercise_category
        });
        setOpenEditModal(true);
    };

    const handleDeleteExercise = async (exercise_id: number) => {
        try {
            const response = await fetch(`https://fitness-network-backend-lcuf.onrender.com/api/exercises/${exercise_id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            setExercises(exercises.filter((exercise: Exercise) => exercise.exercise_id !== exercise_id));
        } catch (error) {
            console.error("Error deleting exercise:", error);
        }
    };

    return (
        <div className="w-full">
            <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold mb-8 text-white"
            >
                Exercises
            </motion.h1>

            {/* Form to create a new exercise */}
            <motion.form 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="w-full bg-slate-800 mx-auto flex items-center flex-col p-6 border border-slate-700 shadow-lg rounded-xl mb-10" 
                onSubmit={(e) => {handleCreateExercise(e)}}
            >
                <h2 className="font-semibold text-xl mb-6 text-white">Add an Exercise</h2>
                <div className="w-full space-y-4">
                    <div className="flex flex-col">
                        <label htmlFor="exercise_name" className="text-slate-300 mb-2">Exercise Name:</label>
                        <input
                            type="text"
                            id="exercise_name"
                            name="exercise_name"
                            className="border border-slate-700 bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors duration-300"
                            placeholder="Enter exercise name"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="exercise_description" className="text-slate-300 mb-2">Description:</label>
                        <input
                            type="text"
                            id="description"
                            name="description"
                            className="border border-slate-700 bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors duration-300"
                            placeholder="Enter exercise description"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="exercise_type" className="text-slate-300 mb-2">Type:</label>
                        <select
                            id="exercise_category"
                            name="exercise_category"
                            className="border border-slate-700 bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors duration-300"
                        >
                            <option value="legs">Legs</option>
                            <option value="back">Back</option>
                            <option value="biceps">Biceps</option>
                            <option value="triceps">Triceps</option>
                            <option value="chest">Chest</option>
                            <option value="shoulders">Shoulders</option>
                            <option value="abs">Abs</option>
                            <option value="glutes">Glutes</option>
                            <option value="calves">Calves</option>
                            <option value="forearms">Forearms</option>
                        </select>
                    </div>
                    <button 
                        type="submit" 
                        className="bg-blue-600 text-white rounded-lg py-2 px-6 cursor-pointer font-semibold hover:bg-blue-700 transition-colors duration-300 mt-4"
                    >
                        Add Exercise
                    </button>
                </div>
            </motion.form>

            {/* Table for displaying all exercises owned */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                {exercises.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-800 text-white">
                                    <th className="border border-slate-700 px-6 py-4 text-left">Name</th>
                                    <th className="border border-slate-700 px-6 py-4 text-left">Description</th>
                                    <th className="border border-slate-700 px-6 py-4 text-left">Category</th>
                                    <th className="border border-slate-700 px-6 py-4 text-center">Sets</th>
                                    <th className="border border-slate-700 px-6 py-4 text-center">Reps</th>
                                    <th className="border border-slate-700 px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {exercises.map((exercise, index) => (
                                    <tr 
                                        key={`${exercise.exercise_id}-${index}`} 
                                        className="hover:bg-slate-700/50 transition-colors duration-300 bg-slate-800 text-white"
                                    >
                                        <td className="border border-slate-700 px-6 py-4">{exercise.exercise_name}</td>
                                        <td className="border border-slate-700 px-6 py-4">{exercise.description}</td>
                                        <td className="border border-slate-700 px-6 py-4">{exercise.exercise_category}</td>
                                        <td className="border border-slate-700 px-6 py-4 text-center">-</td>
                                        <td className="border border-slate-700 px-6 py-4 text-center">-</td>
                                        <td className="border border-slate-700 px-6 py-4 text-center space-x-2">
                                            <button 
                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300" 
                                                onClick={() => {handleOpenEditModal(exercise.exercise_id, exercise.exercise_name, exercise.description, exercise.exercise_category)}}
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-300" 
                                                onClick={() => {handleDeleteExercise(exercise.exercise_id)}}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-slate-300 text-center mt-8">No exercises found.</p>
                )}
            </motion.div>

            {openEditModal && editExercise && (
                <EditExerciseModal exercise={editExercise} setOpenEditModal={setOpenEditModal}/>
            )}
        </div>
    )
}