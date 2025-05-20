'use client';
import { useState, useEffect } from "react";

interface Workout {
    workout_id: number;
    user_id: number;
    workout_name: string;
    workout_category: string;
}

export default function Workouts () {
    const [creatingWorkout, setCreatingWorkout] = useState(false)
    const [edittingWorkout, setEditingWorkout] = useState(false)
    const [workouts, setWorkouts] = useState([]);

    useEffect(() => {
        // Fetch the list of workouts from the server
        const fetchWorkouts = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/workouts', 
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
    }, []);

    return (
        <>
            <div className="w-full">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Workouts</h1>
                    <button onClick={() => setCreatingWorkout(true)} className="bg-purple-400 text-white rounded-md py-2 px-4 cursor-pointer font-semibold">
                    Create Workout
                    </button>
                </div>
                <input type="text" placeholder="Search for workouts" className="border border-gray-300 focus:outline-none rounded p-2 mt-4 w-full" />
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 h-1/2 overflow-y-auto">
                    {workouts.map((workout: Workout, index) => (
                    <li key={index} className="border bg-white border-gray-300 rounded-md p-6 shadow-lg transform transition-transform hover:scale-105 flex flex-col justify-between">
                        <h2 className="font-semibold text-xl">{workout.workout_name}</h2>
                        <p>{index} exercises</p>
                        <button onClick={() => setEditingWorkout(true)} className="bg-purple-400 text-white rounded-md py-2 cursor-pointer font-semibold">Edit</button>
                    </li>
                    ))}
                </ul>
            </div>
        </>
    )
}