'use client';

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import EditExerciseModal from "@/app/components/editExerciseModal";

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
                const response = await fetch('http://172.23.16.1:5001/api/exercises/all', {
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
            const response = await fetch('http://172.23.16.1:5001/api/exercises/no-workout', {
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
            const response = await fetch(`http://172.23.16.1:5001/api/exercises/${exercise_id}`, {
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
            <h1 className="text-2xl font-bold mb-10 text-white">Exercises</h1>
            {/* Form to create a new exercise */}
            <form className="w-lg bg-[#2d2d2d] mx-auto flex items-center flex-col p-4 border border-[#404040] shadow-md rounded-md" onSubmit={(e) => {handleCreateExercise(e)}}>
            <h2 className="font-semibold text-lg mb-4 text-white">Add an Exercise</h2>
            <div className="flex justify-center items-center mb-4 w-full">
            <label htmlFor="exercise_name" className="mr-2 text-white">Exercise Name:</label>
            <input
            type="text"
            id="exercise_name"
            name="exercise_name"
            className="border border-[#404040] bg-[#404040] text-white rounded px-2 py-1 mr-2 w-full"
            placeholder="Enter exercise name"
            />
            </div>
            <div className="flex justify-center items-center mb-4 w-full">
            <label htmlFor="exercise_description" className="mr-2 text-white">Description:</label>
            <input
            type="text"
            id="description"
            name="description"
            className="border border-[#404040] bg-[#404040] text-white rounded px-2 py-1 mr-2 w-full"
            placeholder="Enter exercise description"
            />
            </div>
            <div className="flex flex-row mb-4">
            <label htmlFor="exercise_type" className="mr-2 text-white">Type:</label>
            <select
            id="exercise_category"
            name="exercise_category"
            className="border border-[#404040] bg-[#404040] text-white rounded px-2 py-1 mr-2"
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
            <button type="submit" className="bg-blue-600 text-white rounded-md py-2 px-4 cursor-pointer font-semibold hover:bg-blue-700 transition duration-200">Add</button>
            </form>
            {/* Table for displaying all exercises owned */}
            {exercises.length > 0 ? (
            <table className="table-auto w-full mt-10 border-collapse border border-[#404040] shadow-md rounded-md">
            <thead>
            <tr className="bg-blue-600 text-white">
                <th className="border border-[#404040] px-4 py-2">Name</th>
                <th className="border border-[#404040] px-4 py-2">Description</th>
                <th className="border border-[#404040] px-4 py-2">Category</th>
                <th className="border border-[#404040] px-4 py-2">Sets</th>
                <th className="border border-[#404040] px-4 py-2">Reps</th>
                <th className="border border-[#404040] px-4 py-2">Actions</th>
            </tr>
            </thead>
            <tbody>
            {exercises.map((exercise, index) => (
                <tr key={`${exercise.exercise_id}-${index}`} className="hover:bg-[#404040] transition duration-200 bg-[#2d2d2d] text-white"><td className="border border-[#404040] px-4 py-2">{exercise.exercise_name}</td><td className="border border-[#404040] px-4 py-2">{exercise.description}</td><td className="border border-[#404040] px-4 py-2">{exercise.exercise_category}</td><td className="border border-[#404040] px-4 py-2 text-center">-</td><td className="border border-[#404040] px-4 py-2 text-center">-</td><td className="border border-[#404040] px-4 py-2 text-center"><button className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition duration-200 mr-2" onClick={() => {handleOpenEditModal(exercise.exercise_id, exercise.exercise_name, exercise.description, exercise.exercise_category)}}>Edit</button><button className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition duration-200" onClick={() => {handleDeleteExercise(exercise.exercise_id)}}>Delete</button></td></tr>
            ))}
            </tbody>
            </table>
            ) : (
            <p className="mt-4 text-gray-400">No exercises found.</p>
            )}
            {openEditModal && editExercise && (
                <EditExerciseModal exercise={editExercise} setOpenEditModal={setOpenEditModal}/>
            )}
            
        </div>
    )
}