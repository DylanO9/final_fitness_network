import { useState, useEffect } from "react";
import AddExerciseModal from "./addExerciseModal";

interface Exercise {
    exercise_id: number;
    user_id: number;
    exercise_name: string;
    description: string;
    exercise_category: string;
}

interface EditExerciseModalProps {
    editingExercise: boolean;
    setEditingExercise: (value: boolean) => void;
    workout: Workout;
}
interface Workout {
    workout_id: number;
    user_id: number;
    workout_name: string;
    workout_category: string;
}

export default function EditWorkoutModal({editingExercise, setEditingExercise, workout}: EditExerciseModalProps) {
    // We need the workout_name, workout_category, and a list of exercises
    const [workoutName, setWorkoutName] = useState(workout.workout_name);
    const [workoutCategory, setWorkoutCategory] = useState(workout.workout_category);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [addExercises, setAddExercises] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch the list of exercises from the server
        setLoading(true);
        const fetchExercises = async () => {
            try {
                const response = await fetch(`http://localhost:5001/api/exercises/?workout_id=${workout.workout_id}`, {
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
                // One second delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                setLoading(false);
            } catch (error) {
                console.error("Error fetching exercises:", error);
            }
        };
        fetchExercises();
    }, []);

    if (loading) {
        return (
            <>
            <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 border-gray-800 z-1">
                <div className="bg-white rounded-lg p-4 shadow-lg">
                    <div className="flex items-center justify-center p-64">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-400 border-solid"></div>
                    </div>
                </div>
            </div>
            <div className="fixed inset-0 bg-black opacity-50"></div>
            </>
        );
    }

    const handleWorkoutEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Let's update the workout name and category
        try {
            const response = await fetch(`http://localhost:5001/api/workouts/?workout_id=${workout.workout_id}`, {
                method: 'PUT',
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
        } catch (error) {
            console.error("Error updating workout:", error);
        }

        // Now let's update the exercises
        try {
            const response = await fetch(`http://localhost:5001/api/exercises/update-exercises`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    workout_id: workout.workout_id,
                    exercise_ids: exercises.map((exercise) => exercise.exercise_id),
                }),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            console.log("Successful");
        } catch (error) {
            console.error("Error updating exercises:", error);
        }

        // Reset the form
        setWorkoutName("");
        setWorkoutCategory("");
        setExercises([]);
        setAddExercises(false);
        setEditingExercise(false);
        // Close the modal
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
                <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 border-gray-800 z-1">
                    <div className="bg-white rounded-lg p-4 shadow-lg">
                    <h2 className="text-2xl font-bold mb-4">Edit Workout: {workout.workout_name}</h2>
                    <h3>Customize your workout routine by adding exercises and parameters</h3>
                    <form onSubmit={(e) => handleWorkoutEdit(e)} className="mt-4 flex flex-col">
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
                        {exercises.map((exercise: Exercise, index) => (
                        <li key={index} className="border bg-white border-gray-300 rounded-md p-4 mt-4 shadow-lg transform transition-transform hover:scale-105 flex flex-row justify-between">
                            <div className="flex flex-col">
                                <h2 className="font-semibold text-md">{exercise.exercise_name}</h2>
                                <p className="text-sm text-gray-400">{exercise.exercise_category}</p>
                            </div>
                            {/* Remove selected exercise */}
                            <button onClick={(e) => {
                                e.preventDefault();
                                setExercises(exercises.filter((current_exercise: Exercise) => exercise.exercise_id != current_exercise.exercise_id))
                            }} className="bg-red-400 text-white rounded-md py-1 px-2 cursor-pointer font-semibold mt-2 text-sm">
                                Remove
                            </button>
                        </li>
                        ))}
                    </ul>
                    <div className="flex justify-between">
                        <button onClick={() => handleCancel()} className="border border-gray-300 rounded-md py-2 px-4 cursor-pointer font-semibold mt-4">
                            Cancel
                        </button>
                        <button type="submit" className="block bg-purple-400 text-white rounded-md py-2 px-4 cursor-pointer font-semibold mt-4">
                            Save Changes
                        </button>
                    </div>
                    </form>
                    </div>
                </div>
            )}
            <div className="fixed inset-0 bg-black opacity-50"></div>
            {addExercises && (
                <AddExerciseModal addExercises={addExercises} setAddExercises={setAddExercises} selectedExercises={exercises} setSelectedExercises={setExercises} />
            )}
        </>
    )
}