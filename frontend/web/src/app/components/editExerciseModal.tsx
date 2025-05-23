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

    useEffect(() => {

    }, []);

    const handleExerciseEdit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await fetch(`https://fitness-network-backend-lcuf.onrender.com/api/exercises/?exercise_id=${exercise.exercise_id}`, {
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
        setOpenEditModal(false);
    }

    // if (loading) {
    //     return (
    //         <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 border-gray-800 z-1">
    //             <div className="bg-[#2d2d2d] rounded-lg p-4 shadow-lg">
    //                 <div className="flex items-center justify-center p-64">
    //                     <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-solid"></div>
    //                 </div>
    //             </div>
    //         </div>
    //     );
    // }
    return (
        <>
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 border-gray-800 z-1">
            <div className="bg-[#2d2d2d] rounded-lg p-4 shadow-lg">
                <form className="w-lg mx-auto flex items-center flex-col p-4" onSubmit={(e) => handleExerciseEdit(e)}>
                    <h2 className="font-semibold text-lg mb-4 text-white">Edit Exercise</h2>
                    <div className="flex justify-center items-center mb-4 w-full">
                        <label htmlFor="exercise_name" className="mr-2 text-white">Exercise Name:</label>
                        <input
                            type="text"
                            id="exercise_name"
                            name="exercise_name"
                            className="border border-[#404040] bg-[#404040] text-white rounded px-2 py-1 mr-2 w-full focus:outline-none"
                            placeholder="Enter exercise name"
                            value={exerciseName}
                            onChange={(e) => setExerciseName(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-center items-center mb-4 w-full">
                        <label htmlFor="exercise_description" className="mr-2 text-white">Description:</label>
                        <input
                            type="text"
                            id="exercise_description"
                            name="exercise_description"
                            className="border border-[#404040] bg-[#404040] text-white rounded px-2 py-1 mr-2 w-full focus:outline-none"
                            placeholder="Enter exercise description"
                            value={exerciseDescription}
                            onChange={(e) => setExerciseDescription(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-center items-center mb-4 w-full">
                        <label htmlFor="exercise_category" className="mr-2 text-white">Category:</label>
                        <input
                            type="text"
                            id="exercise_category"
                            name="exercise_category"
                            className="border border-[#404040] bg-[#404040] text-white rounded px-2 py-1 mr-2 w-full focus:outline-none"
                            placeholder="Enter exercise category"
                            value={exerciseCategory}
                            onChange={(e) => setExerciseCategory(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-between w-full">
                        <button onClick={() => setOpenEditModal(false)} className="border border-[#404040] rounded-md py-2 px-4 cursor-pointer font-semibold text-white hover:bg-[#404040] transition-colors duration-200">
                            Cancel
                        </button>
                        <button type="submit" className="bg-blue-600 text-white rounded-md py-2 px-4 cursor-pointer font-semibold hover:bg-blue-700 transition-colors duration-200">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
            <div className="fixed inset-0 bg-black opacity-50"></div>
        </>
    );
}