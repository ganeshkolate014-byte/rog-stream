import React, { useState } from 'react';
import { useApi } from '../services/api';
import { ScheduleDay } from '../types';
import { motion } from 'framer-motion';
import { Clock, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Schedule: React.FC = () => {
  const { data: scheduleData, isLoading } = useApi<ScheduleDay[]>('/schedule');
  const [activeDay, setActiveDay] = useState<string>('');
  
  const schedule = scheduleData || [];
  
  // Set default active day once data is loaded
  React.useEffect(() => {
    if (schedule.length > 0 && !activeDay) {
        setActiveDay(schedule[0].day);
    }
  }, [schedule, activeDay]);

  const currentDaySchedule = schedule.find(s => s.day === activeDay);

  return (
    <div className="min-h-screen bg-dark-900 pt-24 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 border-l-4 border-brand-500 pl-4">Simulcast Schedule</h1>

        {isLoading ? (
            <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
            </div>
        ) : (
            <>
                {/* Day Selector */}
                <div className="flex flex-wrap gap-2 mb-8 bg-zinc-800 p-2 rounded-xl">
                {schedule.map((day) => (
                    <button
                    key={day.day}
                    onClick={() => setActiveDay(day.day)}
                    className={`flex-1 min-w-[100px] py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${
                        activeDay === day.day
                        ? 'bg-brand-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-zinc-700'
                    }`}
                    >
                    {day.day}
                    </button>
                ))}
                </div>

                {/* Episodes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentDaySchedule?.animes.map((item, idx) => (
                    <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-zinc-800 rounded-lg p-4 flex gap-4 hover:bg-zinc-700 transition-colors group"
                    >
                    <div className="w-16 h-24 flex-shrink-0 rounded-md overflow-hidden">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col justify-center flex-1">
                        <div className="flex items-center text-brand-400 text-sm font-bold mb-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {item.time}
                        </div>
                        <Link to={`/anime/${item.id}`}>
                            <h3 className="text-white font-medium group-hover:text-brand-500 transition-colors line-clamp-2">
                            {item.title}
                            </h3>
                        </Link>
                        <span className="text-xs text-gray-500 mt-2">New Episode</span>
                    </div>
                    </motion.div>
                ))}
                {(!currentDaySchedule || currentDaySchedule.animes.length === 0) && (
                    <div className="col-span-full text-center py-20 text-gray-500">
                    No schedule data available for this day.
                    </div>
                )}
                </div>
            </>
        )}
      </div>
    </div>
  );
};