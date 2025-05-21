import { useState, useEffect } from "react";

interface EditExerciseModalProps {
    exercise: Exercise;
    setOpenEditModal: (value: boolean) => void;
}

interface Exercise {
    exercise_id: number;
    user_id: number;
    exercise_name: string;
    description: string;
    exercise_category: string;
}

export default function EditExerciseModal({ exercise, setOpenEditModal }: EditExerciseModalProps) {
    const [exerciseName, setExerciseName] = useState(exercise.exercise_name);
    const [exerciseDescription, setExerciseDescription] = useState(exercise.description);
    const [exerciseCategory, setExerciseCategory] = useState(exercise.exercise_category);
    const [loading, setLoading] = useState(false);

    useEffect(() => {

    }, []);

    const handleExerciseEdit = async () => {
        try {
            const response = await fetch(`http://localhost:5001/api/exercises/?exercise_id=${exercise.exercise_id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({
                        exercise_name: exerciseName,
                        description: exerciseDescription,
                        exercise_category: exerciseCategory
                }),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error("Error updating exercise:", error);
        }
    }

    if (loading) {
        return <div>Loading...</div>;
    }
    return (
        <>
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 border-gray-800 z-1">
            <div className="bg-white rounded-lg p-4 shadow-lg">
                <form className="w-lg bg-white mx-auto flex items-center flex-col p-4 border border-gray-300 shadow-md rounded-md" onSubmit={(e) => handleExerciseEdit()}>
                    <h2 className="font-semibold text-lg mb-4">Edit Exercise</h2>
                    <div className="flex justify-center items-center mb-4 w-full">
                        <label htmlFor="exercise_name" className="mr-2">Exercise Name:</label>
                        <input
                            type="text"
                            id="exercise_name"
                            name="exercise_name"
                            className="border border-gray-300 rounded px-2 py-1 mr-2 w-full"
                            placeholder="Enter exercise name"
                            value={exerciseName}
                            onChange={(e) => setExerciseName(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-center items-center mb-4 w-full">
                        <label htmlFor="exercise_description" className="mr-2">Description:</label>
                        <input
                            type="text"
                            id="exercise_description"
                            name="exercise_description"
                            className="border border-gray-300 rounded px-2 py-1 mr-2 w-full"
                            placeholder="Enter exercise description"
                            value={exerciseDescription}
                            onChange={(e) => setExerciseDescription(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-center items-center mb-4 w-full">
                        <label htmlFor="exercise_category" className="mr-2">Category:</label>
                        <input
                            type="text"
                            id="exercise_category"
                            name="exercise_category"
                            className="border border-gray-300 rounded px-2 py-1 mr-2 w-full"
                            placeholder="Enter exercise category"
                            value={exerciseCategory}
                            onChange={(e) => setExerciseCategory(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="bg-purple-400 text-white rounded-md py-2 px-4 cursor-pointer font-semibold">
                        Save Changes
                    </button>
                    <button onClick={() => setOpenEditModal(false)} className="border border-gray-300 rounded-md py-2 px-4 cursor-pointer font-semibold mt-4">
                        Cancel
                    </button>
                </form>
            </div>
        </div>
            <div className="fixed inset-0 bg-black opacity-50"></div>
        </>
    );
}