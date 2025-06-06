'use client';
import { useState, useEffect } from "react";
import AddExerciseModal from "./addExerciseModal";
import { motion } from 'framer-motion';
import ApiClient, { Exercise, Workout } from '@/utils/apiClient';

interface EditWorkoutModalProps {
    editingExercise: boolean;
    setEditingExercise: (value: boolean) => void;
    workout: Workout;
}

export default function EditWorkoutModal({setEditingExercise, workout}: EditWorkoutModalProps) {
    const [workoutName, setWorkoutName] = useState(workout.workout_name);
    const [workoutCategory, setWorkoutCategory] = useState(workout.workout_category);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [addExercises, setAddExercises] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const fetchExercises = async () => {
            try {
                const { data, error } = await ApiClient.getExercisesByWorkout(workout.workout_id);
                if (error) {
                    throw new Error(error);
                }
                if (data) {
                    setExercises(data);
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
                setLoading(false);
            } catch (error) {
                console.error("Error fetching exercises:", error);
            }
        };
        fetchExercises();
    }, [workout.workout_id]);

    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-700"
                >
                    <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
                    </div>
                </motion.div>
            </div>
        );
    }

    const handleWorkoutEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await ApiClient.updateWorkout(workout.workout_id, {
                workout_name: workoutName,
                workout_category: workoutCategory,
            });
            if (error) {
                throw new Error(error);
            }
        } catch (error) {
            console.error("Error updating workout:", error);
        }

        try {
            const { error } = await ApiClient.updateWorkoutExercises(
                workout.workout_id,
                exercises.map((exercise) => exercise.exercise_id)
            );
            if (error) {
                throw new Error(error);
            }
        } catch (error) {
            console.error("Error updating exercises:", error);
        }
        setLoading(false);
        setWorkoutName("");
        setWorkoutCategory("");
        setExercises([]);
        setAddExercises(false);
        setEditingExercise(false);
    };

    const handleCancel = () => {
        setWorkoutName(workout.workout_name);
        setWorkoutCategory(workout.workout_category);
        setExercises([]);
        setEditingExercise(false);
    };

    return (
        <>
            {!addExercises && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-700 w-full max-w-2xl mx-4"
                    >
                        <h2 className="text-2xl font-bold mb-2 text-white">Edit Workout: {workout.workout_name}</h2>
                        <p className="text-slate-300 mb-6">Customize your workout routine by adding exercises and parameters</p>
                        
                        <form onSubmit={(e) => handleWorkoutEdit(e)} className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex flex-col">
                                    <label className="text-slate-300 mb-2" htmlFor="workout_name">Workout Name</label>
                                    <input 
                                        id="workout_name" 
                                        name="workout_name" 
                                        type="text" 
                                        placeholder="Push" 
                                        className="border border-slate-700 bg-slate-700 text-white focus:outline-none focus:border-blue-500 rounded-lg px-4 py-2 transition-colors duration-300" 
                                        value={workoutName}
                                        onChange={(e) => setWorkoutName(e.target.value)}
                                        required 
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-slate-300 mb-2" htmlFor="workout_category">Workout Type</label>
                                    <input 
                                        id="workout_category" 
                                        name="workout_category" 
                                        type="text" 
                                        placeholder="Chest and Triceps" 
                                        className="border border-slate-700 bg-slate-700 text-white focus:outline-none focus:border-blue-500 rounded-lg px-4 py-2 transition-colors duration-300" 
                                        value={workoutCategory}
                                        onChange={(e) => setWorkoutCategory(e.target.value)}
                                        required 
                                    />
                                </div>
                            </div>

                            <button 
                                type="button"
                                onClick={() => setAddExercises(true)} 
                                className="cursor-pointer w-full border border-slate-700 rounded-lg py-2 px-4 text-slate-300 hover:bg-slate-700 transition-colors duration-300"
                            >
                                + Add Exercises
                            </button>

                            {exercises.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-white">Current Exercises</h3>
                                    <ul className="space-y-3">
                                        {exercises.map((exercise: Exercise, index) => (
                                            <motion.li 
                                                key={index}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-slate-700 border border-slate-600 rounded-lg p-4 flex justify-between items-center"
                                            >
                                                <div>
                                                    <h4 className="font-semibold text-white">{exercise.exercise_name}</h4>
                                                    <p className="text-slate-300 text-sm">{exercise.exercise_category}</p>
                                                </div>
                                                <button 
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setExercises(exercises.filter((current_exercise) => current_exercise.exercise_id !== exercise.exercise_id));
                                                    }} 
                                                    className="cursor-pointer bg-red-500 text-white rounded-lg py-1 px-3 text-sm hover:bg-red-600 transition-colors duration-300"
                                                >
                                                    Remove
                                                </button>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="flex justify-end space-x-4 pt-4 border-t border-slate-700">
                                <button 
                                    type="button"
                                    onClick={handleCancel} 
                                    className="cursor-pointer border border-slate-700 rounded-lg py-2 px-6 text-slate-300 hover:bg-slate-700 transition-colors duration-300"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="cursor-pointer bg-blue-600 text-white rounded-lg py-2 px-6 hover:bg-blue-700 transition-colors duration-300"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {addExercises && (
                <AddExerciseModal setAddExercises={setAddExercises} selectedExercises={exercises} setSelectedExercises={setExercises} />
            )}
        </>
    );
}