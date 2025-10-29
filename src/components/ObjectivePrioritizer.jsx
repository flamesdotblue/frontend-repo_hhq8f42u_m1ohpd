import React, { useMemo, useState } from 'react';
import { Rocket, Plus, Trash2 } from 'lucide-react';

export default function ObjectivePrioritizer({ objectives, setObjectives, onSelectTop }) {
  const [form, setForm] = useState({ name: '', impact: 8, probability: 0.7, time: 10 });

  const scored = useMemo(() => {
    return objectives
      .map((o) => ({
        ...o,
        priority: Number(((o.impact * o.probability) / Math.max(o.time, 0.1)).toFixed(3)),
      }))
      .sort((a, b) => b.priority - a.priority);
  }, [objectives]);

  const addObjective = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const newObj = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      impact: Number(form.impact),
      probability: Number(form.probability),
      time: Number(form.time),
    };
    setObjectives((prev) => [...prev, newObj]);
    setForm({ name: '', impact: 8, probability: 0.7, time: 10 });
  };

  const removeObjective = (id) => setObjectives((prev) => prev.filter((o) => o.id !== id));

  const selectTop3 = () => {
    const top = scored.slice(0, 3);
    onSelectTop(top);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <div className="flex items-center gap-3 mb-4">
        <Rocket className="text-indigo-600" />
        <h2 className="text-xl font-semibold">Priorisation hebdomadaire</h2>
      </div>

      <form onSubmit={addObjective} className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <input
          className="col-span-2 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Objectif (ex: Lancer la page d'inscription)"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <input
          type="number"
          min={1}
          max={10}
          step={1}
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
          placeholder="Impact (1-10)"
          value={form.impact}
          onChange={(e) => setForm((f) => ({ ...f, impact: e.target.value }))}
        />
        <input
          type="number"
          min={0}
          max={1}
          step={0.05}
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
          placeholder="Probabilité (0-1)"
          value={form.probability}
          onChange={(e) => setForm((f) => ({ ...f, probability: e.target.value }))}
        />
        <input
          type="number"
          min={0.5}
          step={0.5}
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
          placeholder="Temps (h)"
          value={form.time}
          onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
        />
        <button
          type="submit"
          className="md:col-span-5 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700 transition"
        >
          <Plus size={18} /> Ajouter
        </button>
      </form>

      {scored.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-600">Priorité = Impact × Probabilité ÷ Temps</p>
            <button
              onClick={selectTop3}
              className="rounded-lg bg-emerald-600 text-white px-3 py-1.5 text-sm hover:bg-emerald-700"
            >
              Sélectionner le Top 3
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            {scored.map((o) => (
              <div key={o.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium">{o.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">Priorité: <span className="font-semibold">{o.priority}</span></p>
                    <p className="text-xs text-slate-500">Impact {o.impact} · Prob {o.probability} · Temps {o.time}h</p>
                  </div>
                  <button
                    onClick={() => removeObjective(o.id)}
                    className="text-slate-400 hover:text-rose-600"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
