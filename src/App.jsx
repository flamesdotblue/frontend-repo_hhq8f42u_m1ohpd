import React, { useMemo, useState } from 'react';
import ObjectivePrioritizer from './components/ObjectivePrioritizer.jsx';
import KanbanBoard from './components/KanbanBoard.jsx';
import FocusMode from './components/FocusMode.jsx';
import ROIDashboard from './components/ROIDashboard.jsx';
import { Rocket } from 'lucide-react';

export default function App() {
  const [objectives, setObjectives] = useState([
    { id: crypto.randomUUID(), name: 'Landing page', impact: 9, probability: 0.7, time: 8 },
    { id: crypto.randomUUID(), name: 'Newsletter hebdo', impact: 7, probability: 0.8, time: 4 },
    { id: crypto.randomUUID(), name: 'Vidéo produit', impact: 8, probability: 0.6, time: 10 },
  ]);
  const [selectedObjectives, setSelectedObjectives] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isLocked, setIsLocked] = useState(false);

  const weekTitle = useMemo(() => {
    const now = new Date();
    const week = getWeekNumber(now);
    return `Semaine ${week}, ${now.getFullYear()}`;
  }, []);

  const handleSelectTop = (top) => {
    setSelectedObjectives(top);
  };

  const handleLockChange = (locked) => setIsLocked(locked);

  const handleAutoSelectTask = (task) => {
    // If there is a task not yet in progress, move it to "Faire" automatically
    if (!task) return;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: 'faire' } : t)));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/80 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="text-indigo-600" />
            <h1 className="text-lg md:text-xl font-semibold">Prioris AI — Accélérateur d'efficience</h1>
          </div>
          <div className="text-sm text-slate-600">{weekTitle}</div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <ObjectivePrioritizer
          objectives={objectives}
          setObjectives={setObjectives}
          onSelectTop={handleSelectTop}
        />

        {selectedObjectives.length > 0 && (
          <KanbanBoard
            selectedObjectives={selectedObjectives}
            tasks={tasks}
            setTasks={setTasks}
            isLocked={isLocked}
          />
        )}

        <FocusMode
          tasks={tasks}
          onLockChange={handleLockChange}
          isLocked={isLocked}
          onAutoSelectTask={handleAutoSelectTask}
        />

        <ROIDashboard tasks={tasks} />

        <footer className="text-center text-xs text-slate-500 pt-6 pb-8">
          Conçu pour réduire: dispersion · perfectionnisme · procrastination
        </footer>
      </main>
    </div>
  );
}

function getWeekNumber(d) {
  // Copy date so don't modify original
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  // Get first day of year
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return weekNo;
}
