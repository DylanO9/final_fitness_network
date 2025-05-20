'use client';
import { useState } from "react";
export default function WorkoutPage({ params }: { params: { workout_name: string } }) {
    const { workout_name } = params;
    const [exercises, setExercises] = useState([
        { name: "Bench Press", sets: 3, reps: 10 },
        { name: "Squats", sets: 3, reps: 10 },
        { name: "Deadlifts", sets: 3, reps: 10 },
        { name: "Pull-ups", sets: 3, reps: 10 },
        { name: "Push-ups", sets: 3, reps: 10 },
        { name: "Lunges", sets: 3, reps: 10 },
    ]);
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-4xl font-bold mb-4">{workout_name}</h1>
            <p className="text-lg">This is the workout page for {workout_name}.</p>
        </div>
    );
}