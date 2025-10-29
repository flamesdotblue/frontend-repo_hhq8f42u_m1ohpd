import React, { useMemo, useState } from 'react';
import { Plus, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

const COLUMNS = [
  { key: 'penser', label: 'Penser' },
  { key: 'planifier', label: 'Planifier' },
  { key: 'faire', label: 'Faire' },
  { key: 'livrer', label: 'Livrer' },
  { key: 'analyser', label: 'Analyser' },
];

export default function KanbanBoard({ selectedObjectives, tasks, setTasks, isLocked }) {
  const [newTask, setNewTask] = useState({ title: '', estimate: 1, deadline: '' , objectiveId: ''});

  const inProgressCount = useMemo(() => tasks.filter(t => t.status === 'faire').length, [tasks]);

  const perObjectiveActiveCount = useMemo(() => {
    const m = new Map();
    for (const t of tasks) {
      if (t.status !== 'livrer' && t.status !== 'analyser') {
        m.set(t.objectiveId, (m.get(t.objectiveId) || 0) + 1);
      }
    }
    return m;
  }, [tasks]);

  const canAdd = useMemo(() => inProgressCount < 3, [inProgressCount]);

  const addTask = (e) => {
    e.preventDefault();
    if (isLocked) return;
    if (!canAdd) return alert('Termine avant d\'ajouter: maximum 3 tâches en cours.');
    if (!newTask.title.trim() || !newTask.objectiveId) return;
    const perObj = perObjectiveActiveCount.get(newTask.objectiveId) || 0;
    if (perObj >= 5) return alert('Maximum 5 tâches actives par objectif.');

    const t = {
      id: crypto.randomUUID(),
      title: newTask.title.trim(),
      estimate: Number(newTask.estimate),
      deadline: newTask.deadline,
      objectiveId: newTask.objectiveId,
      progress: 0,
      status: 'penser',
      createdAt: Date.now(),
    };
    setTasks((prev) => [t, ...prev]);
    setNewTask({ title: '', estimate: 1, deadline: '', objectiveId: '' });
  };

  const moveTask = (id, dir) => {
    if (isLocked) return;
    setTasks((prev) => prev.map((t) => {
      if (t.id !== id) return t;
      const idx = COLUMNS.findIndex(c => c.key === t.status);
      const nextIdx = Math.min(Math.max(idx + dir, 0), COLUMNS.length - 1);
      let nextStatus = COLUMNS[nextIdx].key;
      // enforce anti-dispersion when moving into 'faire'
      if (nextStatus === 'faire' && inProgressCount >= 3 && t.status !== 'faire') {
        alert('Termine avant d\'ajouter: maximum 3 tâches en cours.');
        return t;
      }
      return { ...t, status: nextStatus };
    }));
  };

  const setProgress = (id, val) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, progress: val } : t)));
  };

  const deliverNow = (id) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'livrer', deliveredAt: Date.now() } : t)));
  };

  const grouped = useMemo(() => {
    const g = Object.fromEntries(COLUMNS.map(c => [c.key, []]));
    for (const t of tasks) g[t.status].push(t);
    return g;
  }, [tasks]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Pipeline standardisé</h2>
        {isLocked && (
          <div className="text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-md text-sm flex items-center gap-2">
            <AlertTriangle size={16}/> Modifications bloquées (mode exécution)
          </div>
        )}
      </div>

      <form onSubmit={addTask} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
        <input
          className="col-span-2 w-full rounded-lg border border-slate-200 px-3 py-2"
          placeholder="Nouvelle tâche"
          value={newTask.title}
          onChange={(e) => setNewTask((f) => ({ ...f, title: e.target.value }))}
          disabled={isLocked}
        />
        <select
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
          value={newTask.objectiveId}
          onChange={(e) => setNewTask((f) => ({ ...f, objectiveId: e.target.value }))}
          disabled={isLocked}
        >
          <option value="">Objectif</option>
          {selectedObjectives.map((o) => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
        <input
          type="number"
          min={0.5}
          step={0.5}
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
          placeholder="Estimation (h)"
          value={newTask.estimate}
          onChange={(e) => setNewTask((f) => ({ ...f, estimate: e.target.value }))}
          disabled={isLocked}
        />
        <input
          type="date"
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
          value={newTask.deadline}
          onChange={(e) => setNewTask((f) => ({ ...f, deadline: e.target.value }))}
          disabled={isLocked}
        />
        <button
          type="submit"
          disabled={!canAdd || isLocked}
          className={`md:col-span-5 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-white transition ${(!canAdd || isLocked) ? 'bg-slate-300' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
          <Plus size={18} /> Ajouter la tâche
        </button>
      </form>

      {!canAdd && (
        <div className="text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-md text-sm mb-4">
          Termine avant d'ajouter: maximum 3 tâches en cours non terminées.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {COLUMNS.map((col) => (
          <div key={col.key} className="rounded-xl border border-slate-200 bg-slate-50">
            <div className="px-3 py-2 border-b border-slate-200 font-medium">{col.label}</div>
            <div className="p-3 space-y-3 min-h-[120px]">
              {grouped[col.key].map((t) => (
                <div key={t.id} className="bg-white rounded-lg border border-slate-200 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">{t.title}</p>
                      <p className="text-xs text-slate-500">Est. {t.estimate}h · <span className="inline-flex items-center gap-1"><Clock size={12}/> {t.deadline || '—'}</span></p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveTask(t.id, -1)}
                        className="text-slate-500 hover:text-indigo-600 px-2 disabled:opacity-40"
                        disabled={isLocked || col.key === 'penser'}
                      >◀</button>
                      <button
                        onClick={() => moveTask(t.id, 1)}
                        className="text-slate-500 hover:text-indigo-600 px-2 disabled:opacity-40"
                        disabled={isLocked || col.key === 'analyser'}
                      >▶</button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={t.progress}
                      onChange={(e) => setProgress(t.id, Number(e.target.value))}
                      disabled={isLocked}
                      className="w-full"
                    />
                    <div className="text-xs text-slate-600 mt-1">Progression: {t.progress}%</div>
                  </div>

                  {t.progress >= 80 && t.status !== 'livrer' && (
                    <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded flex items-center justify-between">
                      <span className="inline-flex items-center gap-1"><AlertTriangle size={14}/> Livrable suffisant. Publie ou livre.</span>
                      <button onClick={() => deliverNow(t.id)} className="inline-flex items-center gap-1 text-emerald-700 hover:underline">
                        <CheckCircle2 size={14}/> Livrer maintenant
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {grouped[col.key].length === 0 && (
                <div className="text-xs text-slate-400 italic">Aucune tâche</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
