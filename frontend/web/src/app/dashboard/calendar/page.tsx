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
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-100">
          {format(currentDate, 'MMMM yyyy')}
        </h1>
        <div className="space-x-3">
          <button
            onClick={previousMonth}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Previous
          </button>
          <button
            onClick={nextMonth}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Next
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-8">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center font-semibold p-2 text-blue-300">
            {day}
          </div>
        ))}
        {days.map((day) => (
          <button
            key={day.toString()}
            onClick={() => handleDateClick(day)}
            className={`p-4 text-center rounded-lg transition-all duration-200 ${
              isToday(day) 
                ? 'bg-blue-600 text-white scale-105' 
                : 'bg-gray-800 hover:bg-gray-700 text-white'
            } ${!isSameMonth(day, currentDate) ? 'text-gray-500' : ''}`}
          >
            {format(day, 'd')}
          </button>
        ))}
      </div>

      <form onSubmit={handleAddWorkout} className="mt-8 bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-100">
          Add Workout for {format(currentDate, 'MMMM d, yyyy')}
        </h2>
        <div className="flex gap-4">
          <select
            value={selectedWorkout}
            onChange={(e) => setSelectedWorkout(Number(e.target.value))}
            className="flex-1 p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
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
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Add Workout
          </button>
        </div>
      </form>

      {workoutDataMap.map((workout) => (
        <div key={workout.calendar_entry_id} className="mt-8 bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={() => setExpandedWorkouts(prev => ({
                ...prev,
                [workout.calendar_entry_id]: !prev[workout.calendar_entry_id]
              }))}
              className="flex items-center gap-2 text-2xl font-semibold text-blue-400 hover:text-blue-300"
            >
              <span>{workout.workout_name}</span>
              <svg 
                className={`w-5 h-5 transform transition-transform ${expandedWorkouts[workout.calendar_entry_id] ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              onClick={() => deleteWorkout(workout.calendar_entry_id)}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Delete Workout
            </button>
          </div>
          
          {expandedWorkouts[workout.calendar_entry_id] && (
            <ul className="space-y-4">
              {workout.exercises.map((exercise) => (
                <li key={exercise.exercise_id} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <button
                      onClick={() => setExpandedExercises(prev => ({
                        ...prev,
                        [exercise.exercise_id]: !prev[exercise.exercise_id]
                      }))}
                      className="flex items-center gap-2 text-lg font-medium text-gray-100 hover:text-gray-200"
                    >
                      <span>{exercise.exercise_name}</span>
                      <svg 
                        className={`w-4 h-4 transform transition-transform ${expandedExercises[exercise.exercise_id] ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {expandedExercises[exercise.exercise_id] && (
                    <>
                      <div className="space-y-2 mb-4">
                        {exercise.sets_reps.map((set) => (
                          <div key={set.set_number} className="text-sm text-gray-300">
                            Set {set.set_number}: {set.reps} reps × {set.weight}kg
                            {set.notes && <span className="text-gray-400 ml-2">({set.notes})</span>}
                          </div>
                        ))}
                      </div>
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                        }}
                      >
                        <div className="flex gap-2 items-center">
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
                            className="w-20 p-1 bg-slate-600 text-white rounded"
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
                            className="w-20 p-1 bg-slate-600 text-white rounded"
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
                            className="flex-1 p-1 bg-slate-600 text-white rounded"
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
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            Add Set
                          </button>
                        </div>
                      </form>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}