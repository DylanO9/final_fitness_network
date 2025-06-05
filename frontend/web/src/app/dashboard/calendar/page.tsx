'use client';

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import ApiClient, {CalendarEntryWithExercises, Workout} from "@/utils/apiClient";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workoutDataMap, setWorkoutDataMap] = useState<CalendarEntryWithExercises[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [expandedWorkouts, setExpandedWorkouts] = useState<{[key: number]: boolean}>({});
  const [expandedExercises, setExpandedExercises] = useState<{[key: number]: boolean}>({});
  const [selectedWorkout, setSelectedWorkout] = useState<number | ''>('');
  const [newSetData, setNewSetData] = useState<{
    [key: string]: {
      reps: number;
      weight: number;
      notes: string;
    }
  }>({});
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const handleDateClick = (date: Date) => {
    setCurrentDate(date);
    const formattedDate = format(date, 'yyyy-MM-dd');
    fetchCalendarEntries(formattedDate);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const fetchCalendarEntries = async (date: string) => {
    try {
        const { data, error} = await ApiClient.getCalendarEntriesByDate(date);
        if (error) {
            throw new Error(error);
        }
        if (data) {
            setWorkoutDataMap(data);
            console.log(data);
        }
    } catch (error) {
        console.error('Failed to retrieve calendar date information', error);
    }
  }

  const handleAddSet = async (
    exerciseId: number, 
    entryId: number, 
    workoutId: number,
    setNumber: number,
    reps: number,
    weight: number,
    notes: string
  ) => {
    try {
      const setData = {
        workout_id: workoutId,
        exercise_id: exerciseId,
        set_number: setNumber,
        reps: reps,
        weight: weight,
        notes: notes
      };

      const { data, error } = await ApiClient.addSetRep(entryId, setData);
      
      if (error) {
        throw new Error(error);
      }

      if (data) {
        const formattedDate = format(currentDate, 'yyyy-MM-dd');
        fetchCalendarEntries(formattedDate);
        setNewSetData(prev => ({
          ...prev,
          [exerciseId]: { reps: 0, weight: 0, notes: '' }
        }));
      }
    } catch (error) {
      console.error('Failed to add set:', error);
    }
  };

  const handleAddWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkout) return;

    try {
      const formattedDate = format(currentDate, 'yyyy-MM-dd');
      const { data, error } = await ApiClient.addWorkoutToCalendar(formattedDate, selectedWorkout);
      
      if (error) {
        throw new Error(error);
      }

      if (data) {
        fetchCalendarEntries(formattedDate);
        setSelectedWorkout('');
      }
    } catch (error) {
      console.error('Failed to add workout to calendar:', error);
    }
  };

  const fetchWorkouts = async () => {
    try {
        const { data, error } = await ApiClient.getAllWorkouts();
        if (error) {
            throw new Error(error);
        }
        if (data) {
            setWorkouts(data);
        }
    } catch (error) {
        console.error("Error fetching workouts:", error);
    }
  };

  const deleteWorkout = async (entryId: number) => {
    try {
      const { error } = await ApiClient.deleteWorkoutFromCalendar(entryId);
      if (error) {
        throw new Error(error);
      }
      const formattedDate = format(currentDate, 'yyyy-MM-dd');
      fetchCalendarEntries(formattedDate);
    } catch (error) {
      console.error('Failed to delete workout from calendar:', error);
    }
  };

  const handleSetDataChange = (exerciseId: number, field: 'reps' | 'weight' | 'notes', value: string | number) => {
    setNewSetData(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [field]: value
      }
    }));
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-100">
          {format(currentDate, 'MMMM yyyy')}
        </h1>
        <div className="flex gap-3">
          <button
            onClick={previousMonth}
            className="px-4 py-2 bg-gray-800 text-gray-100 rounded-lg hover:bg-gray-700 transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
          <button
            onClick={nextMonth}
            className="px-4 py-2 bg-gray-800 text-gray-100 rounded-lg hover:bg-gray-700 transition-all duration-200 flex items-center gap-2"
          >
            Next
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-8 bg-gray-800 rounded-xl p-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center font-medium p-3 text-gray-400">
            {day}
          </div>
        ))}
        {days.map((day) => (
          <button
            key={day.toString()}
            onClick={() => handleDateClick(day)}
            className={`p-4 text-center rounded-lg transition-all duration-200 ${
              isToday(day) 
                ? 'bg-blue-600 text-white ring-2 ring-blue-400' 
                : 'bg-gray-700 hover:bg-gray-600 text-gray-100'
            } ${!isSameMonth(day, currentDate) ? 'opacity-50' : ''}`}
          >
            {format(day, 'd')}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-100">
            Add Workout for {format(currentDate, 'MMMM d, yyyy')}
          </h2>
          <form onSubmit={handleAddWorkout} className="space-y-4">
            <div className="flex gap-4">
              <select
                value={selectedWorkout}
                onChange={(e) => setSelectedWorkout(Number(e.target.value))}
                className="flex-1 p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200"
              >
                <option value="">Select a workout</option>
                {workouts.map((workout) => (
                  <option key={workout.workout_id} value={workout.workout_id}>
                    {workout.workout_name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={!selectedWorkout}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Workout
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          {workoutDataMap.map((workout) => (
            <div key={workout.calendar_entry_id} className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <button 
                  onClick={() => setExpandedWorkouts(prev => ({
                    ...prev,
                    [workout.calendar_entry_id]: !prev[workout.calendar_entry_id]
                  }))}
                  className="flex items-center gap-2 text-xl font-semibold text-gray-100 hover:text-blue-400 transition-colors duration-200"
                >
                  <span>{workout.workout_name}</span>
                  <svg 
                    className={`w-5 h-5 transform transition-transform duration-200 ${expandedWorkouts[workout.calendar_entry_id] ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => deleteWorkout(workout.calendar_entry_id)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              
              {expandedWorkouts[workout.calendar_entry_id] && (
                <div className="space-y-4">
                  {workout.exercises.map((exercise) => (
                    <div key={exercise.exercise_id} className="bg-gray-700/50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <button
                          onClick={() => setExpandedExercises(prev => ({
                            ...prev,
                            [exercise.exercise_id]: !prev[exercise.exercise_id]
                          }))}
                          className="flex items-center gap-2 text-lg font-medium text-gray-100 hover:text-blue-400 transition-colors duration-200"
                        >
                          <span>{exercise.exercise_name}</span>
                          <svg 
                            className={`w-4 h-4 transform transition-transform duration-200 ${expandedExercises[exercise.exercise_id] ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>

                      {expandedExercises[exercise.exercise_id] && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {exercise.sets_reps.map((set) => (
                              <div key={set.set_number} className="bg-gray-700 p-3 rounded-lg text-sm text-gray-300">
                                <div className="font-medium text-gray-100">Set {set.set_number}</div>
                                <div className="flex justify-between mt-1">
                                  <span>{set.reps} reps</span>
                                  <span>{set.weight}kg</span>
                                </div>
                                {set.notes && (
                                  <div className="mt-1 text-gray-400 text-xs">{set.notes}</div>
                                )}
                              </div>
                            ))}
                          </div>
                          
                          <form 
                            onSubmit={(e) => {
                              e.preventDefault();
                            }}
                            className="bg-gray-700 p-4 rounded-lg"
                          >
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <input
                                type="number"
                                placeholder="Reps"
                                value={newSetData[exercise.exercise_id]?.reps || ''}
                                onChange={(e) => setNewSetData(prev => ({
                                  ...prev,
                                  [exercise.exercise_id]: {
                                    ...prev[exercise.exercise_id],
                                    reps: parseInt(e.target.value) || 0
                                  }
                                }))}
                                className="p-2 bg-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200"
                              />
                              <input
                                type="number"
                                placeholder="Weight"
                                value={newSetData[exercise.exercise_id]?.weight || ''}
                                onChange={(e) => setNewSetData(prev => ({
                                  ...prev,
                                  [exercise.exercise_id]: {
                                    ...prev[exercise.exercise_id],
                                    weight: parseInt(e.target.value) || 0
                                  }
                                }))}
                                className="p-2 bg-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200"
                              />
                              <input
                                type="text"
                                placeholder="Notes"
                                value={newSetData[exercise.exercise_id]?.notes || ''}
                                onChange={(e) => setNewSetData(prev => ({
                                  ...prev,
                                  [exercise.exercise_id]: {
                                    ...prev[exercise.exercise_id],
                                    notes: e.target.value
                                  }
                                }))}
                                className="col-span-2 sm:col-span-1 p-2 bg-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-200"
                              />
                              <button
                                type="submit"
                                onClick={() => {
                                  const setNumber = exercise.sets_reps.length + 1;
                                  const setData = newSetData[exercise.exercise_id];
                                  if (setData) {
                                    handleAddSet(
                                      exercise.exercise_id,
                                      workout.calendar_entry_id,
                                      workout.workout_id,
                                      setNumber,
                                      setData.reps,
                                      setData.weight,
                                      setData.notes
                                    );
                                  }
                                }}
                                className="col-span-2 sm:col-span-1 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Set
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}