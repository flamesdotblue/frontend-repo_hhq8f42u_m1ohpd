import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, Timer, Lock } from 'lucide-react';

export default function FocusMode({ tasks, onLockChange, isLocked, onAutoSelectTask }) {
  const [preset, setPreset] = useState('25-5'); // or '45-15'
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState('work'); // 'work' | 'break'
  const [remaining, setRemaining] = useState(0);
  const intervalRef = useRef(null);

  const { workMin, breakMin } = useMemo(() => {
    const [w, b] = preset.split('-').map(Number);
    return { workMin: w, breakMin: b };
  }, [preset]);

  const nextActionLabel = running ? 'Pause' : 'Démarrer';

  const firstActionableTask = useMemo(() => {
    return tasks.find((t) => t.status !== 'livrer' && t.status !== 'analyser');
  }, [tasks]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => setRemaining((r) => Math.max(r - 1, 0)), 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  useEffect(() => {
    if (remaining === 0 && running) {
      if (phase === 'work') {
        setPhase('break');
        setRemaining(breakMin * 60);
      } else {
        setRunning(false);
        onLockChange(false);
      }
    }
  }, [remaining, running, phase, breakMin, onLockChange]);

  const toggle = () => {
    if (running) {
      setRunning(false);
      onLockChange(false);
    } else {
      // Auto-select first task of the day
      onAutoSelectTask(firstActionableTask || null);
      setPhase('work');
      setRemaining(workMin * 60);
      setRunning(true);
      onLockChange(true);
    }
  };

  const mmss = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Timer className="text-indigo-600" />
          <h2 className="text-xl font-semibold">Mode exécution forcée</h2>
        </div>
        {isLocked && (
          <div className="inline-flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded">
            <Lock size={16}/> Plan verrouillé
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">Préset</label>
          <select
            value={preset}
            onChange={(e) => setPreset(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2"
            disabled={running}
          >
            <option value="25-5">25 / 5</option>
            <option value="45-15">45 / 15</option>
          </select>
        </div>

        <button
          onClick={toggle}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-white transition ${running ? 'bg-slate-600 hover:bg-slate-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
        >
          {running ? <Pause size={18}/> : <Play size={18}/>} {nextActionLabel}
        </button>

        <div className="text-3xl font-mono tracking-widest">{mmss(remaining)}</div>
        <div className="text-sm text-slate-500">Phase: {phase === 'work' ? 'Travail' : 'Pause'}</div>
      </div>

      <div className="mt-4 text-sm text-slate-600">
        {firstActionableTask ? (
          <p>Prochaine tâche suggérée: <span className="font-medium">{firstActionableTask.title}</span></p>
        ) : (
          <p>Aucune tâche à exécuter. Ajoutez-en dans le pipeline.</p>
        )}
      </div>
    </div>
  );
}
