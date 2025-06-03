'use client';
import { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import ApiClient, { Exercise } from '@/utils/apiClient';

interface AddExerciseModalProps {
    setAddExercises: (value: boolean) => void;
    selectedExercises: Exercise[];
    setSelectedExercises: (exercises: Exercise[]) => void;
}

export default function AddExerciseModal({ setAddExercises, selectedExercises, setSelectedExercises }: AddExerciseModalProps) {
    // What data do we need?
    // - List of exercises
    // - Selected exercises
    // - Search term
    // - Function to add exercises to workout
    // - Function to close modal
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
    const [currentSelectedExercises, setCurrentSelectedExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExercises = async () => {
            try {
                const { data, error } = await ApiClient.getAllExercises();
                if (error) {
                    throw new Error(error);
                }
                if (data) {
                    setExercises(data);
                    setFilteredExercises(data);
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching exercises:", error);
            }
        };
        fetchExercises();
    }, []);

    const handleAddExercises = () => {
        const newSelectedExercises = [...selectedExercises, ...currentSelectedExercises];
        setSelectedExercises(newSelectedExercises);
        setAddExercises(false);
        setCurrentSelectedExercises([]);
        setFilteredExercises([]);
    };

    const handleCancel = () => {
        setCurrentSelectedExercises([]);
        setFilteredExercises([]);
        setAddExercises(false);
    };
    
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
    
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-700 w-full max-w-2xl mx-4"
            >
                <h2 className="text-2xl font-bold mb-2 text-white">Add Exercises to Workout</h2>
                <p className="text-slate-300 mb-6">Select exercises to add to your workout routine</p>

                <div className="space-y-6">
                    <input 
                        type="text" 
                        placeholder="Search for exercises..." 
                        className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 border border-slate-600 transition-colors duration-300" 
                        onChange={(e) => {
                            const searchTerm = e.target.value.toLowerCase();
                            setFilteredExercises(
                                exercises.filter(exercise => 
                                    exercise.exercise_name.toLowerCase().includes(searchTerm) || 
                                    exercise.exercise_category.toLowerCase().includes(searchTerm)
                                )
                            );
                        }}
                    />
                    
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {filteredExercises.map((exercise: Exercise, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-slate-700 border border-slate-600 rounded-lg p-4 hover:bg-slate-600/50 transition-colors duration-300"
                            >
                                <label className="flex items-center space-x-4 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 rounded border-slate-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-800" 
                                        checked={selectedExercises.some((selectedExercise) => selectedExercise.exercise_id === exercise.exercise_id) || 
                                                currentSelectedExercises.some((selectedExercise) => selectedExercise.exercise_id === exercise.exercise_id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setCurrentSelectedExercises([...currentSelectedExercises, exercise]);
                                            } else {
                                                setCurrentSelectedExercises(currentSelectedExercises.filter((selectedExercise) => selectedExercise.exercise_id !== exercise.exercise_id));
                                                setSelectedExercises(selectedExercises.filter((selectedExercise) => selectedExercise.exercise_id !== exercise.exercise_id));
                                            }
                                        }} 
                                    />
                                    <div>
                                        <h3 className="font-semibold text-white">{exercise.exercise_name}</h3>
                                        <p className="text-slate-300 text-sm">{exercise.exercise_category}</p>
                                    </div>
                                </label>
                            </motion.div>
                        ))}
                    </div>

                    <div className="flex justify-end space-x-4 pt-4 border-t border-slate-700">
                        <button 
                            onClick={handleCancel} 
                            className="cursor-pointer border border-slate-700 rounded-lg py-2 px-6 text-slate-300 hover:bg-slate-700 transition-colors duration-300"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleAddExercises} 
                            className="cursor-pointer bg-blue-600 text-white rounded-lg py-2 px-6 hover:bg-blue-700 transition-colors duration-300"
                        >
                            Add to Workout
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}