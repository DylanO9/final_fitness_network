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
    creatingWorkout: boolean;
    setCreatingWorkout: (value: boolean) => void;
}

export default function CreateWorkoutModal({creatingWorkout, setCreatingWorkout}: CreateWorkoutModalProps) {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [addExercises, setAddExercises] = useState(false);
    const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
    const [workoutName, setWorkoutName] = useState("");
    const [workoutCategory, setWorkoutCategory] = useState("");

    const handleWorkoutCreation = async (e: React.FormEvent) => {
        e.preventDefault();
        let workout_id = null;
        try {
            const response = await fetch('http://localhost:5001/api/workouts', {
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
            const response = await fetch('http://localhost:5001/api/exercises/add-existing-exercises', {
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
        setExercises([]);
        setCreatingWorkout(false);
    };

    return (
        <>
            {!addExercises && (
            <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 border-gray-800 z-1">
                <div className="bg-white rounded-lg p-4 shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Create a new workout</h2>
                <h3>Customize your workout routine by adding exercises and parameters</h3>
                <form onSubmit={(e) => handleWorkoutCreation(e)} className="mt-4 flex flex-col">
                    <div className="flex flex-col">
                        <label className="text-md" htmlFor="workout_name">Workout Name</label>
                        <input 
                            id="workout_name" 
                            name="workout_name" 
                            type="text" 
                            placeholder="Push" 
                            className="border border-gray-300 focus:outline-none rounded p-2 mt-2 w-full" 
                            value={workoutName}
                            onChange={(e) => setWorkoutName(e.target.value)}
                            required 
                        />
                    </div>
                    <div className="flex flex-col mt-4">
                        <label className="text-md" htmlFor="workout_category">Workout Type</label>
                        <input 
                            id="workout_category" 
                            name="workout_category" 
                            type="text" 
                            placeholder="Chest and Triceps" 
                            className="border border-gray-300 focus:outline-none rounded p-2 mt-2 w-full" 
                            value={workoutCategory}
                            onChange={(e) => setWorkoutCategory(e.target.value)}
                            required 
                        />
                    </div>
                <button onClick={() => setAddExercises(true)} className="rounded-md py-2 px-4 cursor-pointer mt-4 border-gray-300 border">
                    + Add Exercises
                </button>
                <ul>
                    <h3 className='mt-4 font-semibold'>Exercises</h3>
                    {selectedExercises.map((exercise: Exercise, index) => (
                    <li key={index} className="border bg-white border-gray-300 rounded-md p-4 mt-4 shadow-lg transform transition-transform hover:scale-105 flex flex-row justify-between">
                        <div className="flex flex-col">
                            <h2 className="font-semibold text-md">{exercise.exercise_name}</h2>
                            <p className="text-sm text-gray-400">{exercise.exercise_category}</p>
                        </div>
                        {/* Remove selected exercise */}
                        <button onClick={() => {
                            setSelectedExercises(selectedExercises.filter((selectedExercise) => selectedExercise.exercise_id !== exercise.exercise_id));
                        }} className="bg-red-400 text-white rounded-md py-1 px-2 cursor-pointer font-semibold mt-2 text-sm">
                            Remove
                        </button>
                    </li>
                    ))}
                </ul>
                <button type="submit" className="block bg-purple-400 text-white rounded-md py-2 px-4 cursor-pointer font-semibold mt-4">
                    Create Workout
                </button>
                </form>
                </div>
            </div>
            )
        }
            <div className="fixed inset-0 bg-black opacity-50"></div>

            {/* Modal for adding exercises */}
            {addExercises && (
                <AddExerciseModal addExercises={addExercises} setAddExercises={setAddExercises} selectedExercises={selectedExercises} setSelectedExercises={setSelectedExercises}  />
            )}
        </>
    );
}