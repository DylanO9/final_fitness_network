{/* Modal for creating a new workout */}
{creatingWorkout && !addExercises && (
    <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 border-gray-800 z-1">
        <div className="bg-white rounded-lg p-4 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Create a new workout</h2>
        <h3>Customize your workout routine by adding exercises and parameters</h3>
        <form className="mt-4 flex flex-row">
            <div className="flex flex-col w-1/2">
            <label className="text-md">Workout Name</label>
            <input type="text" placeholder="Workout Name" className="border border-gray-300 focus:outline-none rounded p-2 mt-4 w-full" />
            </div>
            <div className="flex flex-col w-1/2 ml-4">
            <label className="text-md">Workout Type</label>
            <input type="text" placeholder="Workout Type" className="border border-gray-300 focus:outline-none rounded p-2 mt-4 w-full" />
            </div>
        </form>
        <button onClick={() => setAddExecises(true)} className="rounded-md py-2 px-4 cursor-pointer mt-4 border-gray-300 border">
            + Add Exercises
        </button>
        <ul>
            <h3 className='mt-4 font-semibold'>Exercises</h3>
            {exercises.map((exercise, index) => (
            <li key={index} className="border bg-white border-gray-300 rounded-md p-2 shadow-lg transform transition-transform hover:scale-105 flex flex-col justify-between">
                <h2 className="font-semibold text-xl">{exercise.name}</h2>
                <p>{exercise.sets} sets x {exercise.reps} reps</p>
            </li>
            ))}
        </ul>
        </div>
    </div>
    )}

    {/* Dark overlay */}
    {creatingWorkout && (
    <div className="fixed inset-0 bg-black opacity-50"></div>
    )}  

    {/* Modal for adding exercises */}
    {addExercises && (
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
                exercise.name.toLowerCase().includes(searchTerm) || 
                exercise.bodyPart.toLowerCase().includes(searchTerm) || 
                exercise.equipment.toLowerCase().includes(searchTerm)
                )
            );
            }}
        />
        <ul className="flex flex-col">
            {filteredExercises.slice(0, 3).map((exercise, index) => (
            <li key={index} className="hover:bg-gray-100 bg-white rounded-md p-6 shadow-lg transform transition-transform hover:scale-105 flex flex-col justify-between">
                <label className="flex items-center">
                <input 
                    type="checkbox" 
                    className="mr-2" 
                    onChange={(e) => {
                    if (e.target.checked) {
                        setSelectedExercises([...selectedExercises, exercise]);
                        console.log("Selected exercises:", [...selectedExercises, exercise]);
                    } else {
                        setSelectedExercises(selectedExercises.filter(selectedExercise => selectedExercise.name !== exercise.name));
                    }
                    }} 
                />
                <div>
                    <h2 className="font-semibold text-md">{exercise.name}</h2>
                    <p className="text-sm text-gray-400"><span>{exercise.bodyPart}</span> * {exercise.equipment}</p>
                </div>
                </label>
            </li>
            ))}
        </ul>
        <div className="flex justify-between">
            <button onClick={() => setAddExecises(false)} className="border border-gray-300 rounded-md py-2 px-4 cursor-pointer font-semibold mt-4">
            Cancel
            </button>
            <button onClick={() => {
            console.log("Selected exercises:", filteredExercises);
            setAddExecises(false);
            }} className="bg-purple-400 text-white rounded-md py-2 px-4 cursor-pointer font-semibold mt-4">
            Add to Workout
            </button>
        </div>
        </div>
    </div>
    )}