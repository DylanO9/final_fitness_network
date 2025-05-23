import { useState } from "react";
import AddExerciseModal from "./addExerciseModal";
import { motion } from 'framer-motion';

interface Exercise {
    exercise_id: number;
    user_id: number;
    exercise_name: string;
    description: string;
    exercise_category: string;
}

interface Workout {
    workout_id: number;
    user_id: number;
    workout_name: string;
    workout_category: string;
}

interface CreateWorkoutModalProps {
    setCreatingWorkout: (value: boolean) => void;
    setWorkouts: (value: Workout[]) => void;
}

export default function CreateWorkoutModal({ setCreatingWorkout}: CreateWorkoutModalProps) {
    const [addExercises, setAddExercises] = useState(false);
    const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
    const [workoutName, setWorkoutName] = useState("");
    const [workoutCategory, setWorkoutCategory] = useState("");
    const [loading, setLoading] = useState(false);

    const handleWorkoutCreation = async (e: React.FormEvent) => {
        e.preventDefault();
        let workout_id = null;
        setLoading(true);
        try {
            const response = await fetch('https://fitness-network-backend-lcuf.onrender.com/api/workouts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    workout_name: workoutName,
                    workout_category: workoutCategory,
                }),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log(data);
            workout_id = data.workout_id;
        } catch (error) {
            console.error("Error creating workout:", error);
        }

        // Add exercises to the workout
        try {
            const response = await fetch('https://fitness-network-backend-lcuf.onrender.com/api/exercises/add-existing-exercises', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    workout_id: workout_id,
                    exercise_ids: selectedExercises.map((exercise) => exercise.exercise_id),
                }),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log(data);
        }
        catch (error) {
            console.error("Error adding exercises to workout:", error);
        }
        setLoading(false);

        // Reset the form
        setWorkoutName("");
        setWorkoutCategory("");
        setSelectedExercises([]);
        setAddExercises(false);
        setCreatingWorkout(false);
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
        <>
            {!addExercises && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-700 w-full max-w-2xl mx-4"
                    >
                        <h2 className="text-2xl font-bold mb-2 text-white">Create a new workout</h2>
                        <p className="text-slate-300 mb-6">Customize your workout routine by adding exercises and parameters</p>
                        
                        <form onSubmit={(e) => handleWorkoutCreation(e)} className="space-y-6">
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
                                className="w-full border border-slate-700 rounded-lg py-2 px-4 text-slate-300 hover:bg-slate-700 transition-colors duration-300"
                            >
                                + Add Exercises
                            </button>

                            {selectedExercises.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-white">Selected Exercises</h3>
                                    <ul className="space-y-3">
                                        {selectedExercises.map((exercise: Exercise, index) => (
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
                                                        setSelectedExercises(selectedExercises.filter((selectedExercise) => selectedExercise.exercise_id !== exercise.exercise_id));
                                                    }} 
                                                    className="bg-red-500 text-white rounded-lg py-1 px-3 text-sm hover:bg-red-600 transition-colors duration-300"
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
                                    onClick={() => setCreatingWorkout(false)} 
                                    className="border border-slate-700 rounded-lg py-2 px-6 text-slate-300 hover:bg-slate-700 transition-colors duration-300"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="bg-blue-600 text-white rounded-lg py-2 px-6 hover:bg-blue-700 transition-colors duration-300"
                                >
                                    Create Workout
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Modal for adding exercises */}
            {addExercises && (
                <AddExerciseModal setAddExercises={setAddExercises} selectedExercises={selectedExercises} setSelectedExercises={setSelectedExercises} />
            )}
        </>
    );
}