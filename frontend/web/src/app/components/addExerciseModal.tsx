import { useState, useEffect } from "react";

interface Exercise {
    exercise_id: number;
    user_id: number;
    exercise_name: string;
    description: string;
    exercise_category: string;
}

interface AddExerciseModalProps {
    addExercises: boolean;
    setAddExercises: (value: boolean) => void;
    selectedExercises: Exercise[];
    setSelectedExercises: (value: Exercise[]) => void;
}

export default function addExerciseModal({addExercises, setAddExercises, selectedExercises, setSelectedExercises}: AddExerciseModalProps) {
    // What data do we need?
    // - List of exercises
    // - Selected exercises
    // - Search term
    // - Function to add exercises to workout
    // - Function to close modal
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
    const [currentSelectedExercises, setCurrentSelectedExercises] = useState<Exercise[]>([]);

    useEffect(() => {
        // Fetch the list of exercises from the server
        const fetchExercises = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/exercises/all', {
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
                setFilteredExercises(data);
            } catch (error) {
                console.error("Error fetching exercises:", error);
            }
        };
        fetchExercises();
    }, []);

    const handleAddExercises = () => {
        // add the currentSelectedExercises to the selectedExercises
        const newSelectedExercises = [...selectedExercises, ...currentSelectedExercises];
        setSelectedExercises(newSelectedExercises);
        setAddExercises(false);
        setCurrentSelectedExercises([]);
        setFilteredExercises([]);
    }

    const handleCancel = () => {
        setCurrentSelectedExercises([]);
        setFilteredExercises([]);
        setAddExercises(false);
    };
    
    
    return (
        <>
            <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 border-gray-800 z-1">
                <div className="bg-white rounded-lg p-4 shadow-lg sm:w-md">
                <h2 className="text-2xl font-bold mb-4">Add Exercises to Workout</h2>
                <input 
                    type="text" 
                    placeholder="Search for exercises" 
                    className="border border-gray-300 focus:outline-none rounded p-2 mt-4 w-full" 
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
                <ul className="flex flex-col">
                    {filteredExercises.map((exercise: Exercise, index) => (
                    <li key={index} className="overflow-y-auto hover:bg-gray-100 bg-white rounded-md p-6 shadow-lg transform transition-transform hover:scale-105 flex flex-col justify-between">
                        <label className="flex items-center">
                        <input 
                            type="checkbox" 
                            className="mr-2" 
                            checked={selectedExercises.some((selectedExercise) => selectedExercise.exercise_id === exercise.exercise_id) || currentSelectedExercises.some((selectedExercise) => selectedExercise.exercise_id === exercise.exercise_id)}
                            onChange={(e) => {
                            if (e.target.checked) {
                                setCurrentSelectedExercises([...currentSelectedExercises, exercise]);
                                console.log("Selected exercises:", selectedExercises);
                            } else {
                                setCurrentSelectedExercises(currentSelectedExercises.filter((selectedExercise) => selectedExercise.exercise_id !== exercise.exercise_id));
                                setSelectedExercises(selectedExercises.filter((selectedExercise) => selectedExercise.exercise_id !== exercise.exercise_id));
                            }
                            }} 
                        />
                        <div>
                            <h2 className="font-semibold text-md">{exercise.exercise_name}</h2>
                            <p className="text-sm text-gray-400">{exercise.exercise_category}</p>
                        </div>
                        </label>
                    </li>
                    ))}
                </ul>
                <div className="flex justify-between">
                    <button onClick={() => handleCancel()} className="border border-gray-300 rounded-md py-2 px-4 cursor-pointer font-semibold mt-4">
                    Cancel
                    </button>
                    <button onClick={() => handleAddExercises()} className="bg-purple-400 text-white rounded-md py-2 px-4 cursor-pointer font-semibold mt-4">
                    Add to Workout
                    </button>
                </div>
                </div>
            </div>
        </>
    );
}