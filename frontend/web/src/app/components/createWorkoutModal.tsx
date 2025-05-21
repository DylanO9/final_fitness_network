import { useState } from "react";
import AddExerciseModal from "./addExerciseModal";

interface Exercise {
    exercise_id: number;
    user_id: number;
    exercise_name: string;
    description: string;
    exercise_category: string;
}

interface CreateWorkoutModalProps {
    setCreatingWorkout: (value: boolean) => void;
}

export default function CreateWorkoutModal({ setCreatingWorkout}: CreateWorkoutModalProps) {
    const [addExercises, setAddExercises] = useState(false);
    const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
    const [workoutName, setWorkoutName] = useState("");
    const [workoutCategory, setWorkoutCategory] = useState("");

    const handleWorkoutCreation = async (e: React.FormEvent) => {
        e.preventDefault();
        let workout_id = null;
        try {
            const response = await fetch('http://172.23.16.1:5001/api/workouts', {
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
            const response = await fetch('http://172.23.16.1:5001/api/exercises/add-existing-exercises', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    workout_id: workout_id, // Replace with the actual workout ID
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

        // Reset the form
        setWorkoutName("");
        setWorkoutCategory("");
        setSelectedExercises([]);
        setAddExercises(false);
        setCreatingWorkout(false);
    };

    return (
        <>
            {!addExercises && (
            <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 border-gray-800 z-1">
                <div className="bg-[#2d2d2d] rounded-lg p-4 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-white">Create a new workout</h2>
                <h3 className="text-gray-400">Customize your workout routine by adding exercises and parameters</h3>
                <form onSubmit={(e) => handleWorkoutCreation(e)} className="mt-4 flex flex-col">
                    <div className="flex flex-col">
                        <label className="text-md text-white" htmlFor="workout_name">Workout Name</label>
                        <input 
                            id="workout_name" 
                            name="workout_name" 
                            type="text" 
                            placeholder="Push" 
                            className="border border-[#404040] bg-[#404040] text-white focus:outline-none rounded p-2 mt-2 w-full" 
                            value={workoutName}
                            onChange={(e) => setWorkoutName(e.target.value)}
                            required 
                        />
                    </div>
                    <div className="flex flex-col mt-4">
                        <label className="text-md text-white" htmlFor="workout_category">Workout Type</label>
                        <input 
                            id="workout_category" 
                            name="workout_category" 
                            type="text" 
                            placeholder="Chest and Triceps" 
                            className="border border-[#404040] bg-[#404040] text-white focus:outline-none rounded p-2 mt-2 w-full" 
                            value={workoutCategory}
                            onChange={(e) => setWorkoutCategory(e.target.value)}
                            required 
                        />
                    </div>
                <button onClick={() => setAddExercises(true)} className="rounded-md py-2 px-4 cursor-pointer mt-4 border-[#404040] border text-white hover:bg-[#404040] transition-colors duration-200">
                    + Add Exercises
                </button>
                <ul>
                    <h3 className='mt-4 font-semibold text-white'>Exercises</h3>
                    {selectedExercises.map((exercise: Exercise, index) => (
                    <li key={index} className="border bg-[#404040] border-[#404040] rounded-md p-4 mt-4 shadow-lg transform transition-transform hover:scale-105 flex flex-row justify-between">
                        <div className="flex flex-col">
                            <h2 className="font-semibold text-md text-white">{exercise.exercise_name}</h2>
                            <p className="text-sm text-gray-400">{exercise.exercise_category}</p>
                        </div>
                        {/* Remove selected exercise */}
                        <button onClick={(e) => {
                            e.preventDefault();
                            setSelectedExercises(selectedExercises.filter((selectedExercise) => selectedExercise.exercise_id !== exercise.exercise_id));
                        }} className="bg-red-500 text-white rounded-md py-1 px-2 cursor-pointer font-semibold mt-2 text-sm hover:bg-red-600 transition-colors duration-200">
                            Remove
                        </button>
                    </li>
                    ))}
                </ul>
                <div className="flex justify-between">
                    <button onClick={() => setCreatingWorkout(false)} className="border border-[#404040] rounded-md py-2 px-4 cursor-pointer font-semibold mt-4 text-white hover:bg-[#404040] transition-colors duration-200">
                    Cancel
                    </button>
                    <button type="submit" className="block bg-blue-600 text-white rounded-md py-2 px-4 cursor-pointer font-semibold mt-4 hover:bg-blue-700 transition-colors duration-200">
                        Create Workout
                    </button>
                </div>
                </form>
                </div>
            </div>
            )
        }
            <div className="fixed inset-0 bg-black opacity-50"></div>

            {/* Modal for adding exercises */}
            {addExercises && (
                <AddExerciseModal setAddExercises={setAddExercises} selectedExercises={selectedExercises} setSelectedExercises={setSelectedExercises}  />
            )}
        </>
    );
}