import React, { useMemo, useState } from 'react';

export default function ROIDashboard({ tasks }) {
  const [impacts, setImpacts] = useState({}); // taskId -> impact score (0-10)

  const delivered = useMemo(() => tasks.filter(t => t.status === 'livrer'), [tasks]);

  const weeklySummary = useMemo(() => {
    const byWeek = new Map();
    for (const t of delivered) {
      const d = new Date(t.deliveredAt || Date.now());
      const weekKey = `${d.getFullYear()}-W${getWeekNumber(d)}`;
      const impact = Number(impacts[t.id] || 0);
      const cur = byWeek.get(weekKey) || { count: 0, impact: 0 };
      cur.count += 1;
      cur.impact += impact;
      byWeek.set(weekKey, cur);
    }
    const entries = Array.from(byWeek.entries()).sort();
    return entries.map(([k, v]) => ({ week: k, count: v.count, impact: v.impact }));
  }, [delivered, impacts]);

  const recommendations = useMemo(() => {
    // Very simple rule: prioritize objectives whose tasks brought highest impact per hour
    const byObjective = new Map();
    for (const t of delivered) {
      const impact = Number(impacts[t.id] || 0);
      const cur = byObjective.get(t.objectiveId) || { impact: 0, hours: 0 };
      cur.impact += impact;
      cur.hours += Number(t.estimate || 0);
      byObjective.set(t.objectiveId, cur);
    }
    const ranked = Array.from(byObjective.entries()).map(([id, v]) => ({ id, score: v.hours ? v.impact / v.hours : 0 }));
    ranked.sort((a, b) => b.score - a.score);
    return ranked.slice(0, 3);
  }, [delivered, impacts]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <h2 className="text-xl font-semibold mb-4">Scoring & ROI</h2>

      {delivered.length === 0 ? (
        <p className="text-sm text-slate-500">Aucun livrable pour l'instant. Livrez une tâche pour mesurer l'impact.</p>
      ) : (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            {delivered.map((t) => (
              <div key={t.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{t.title}</p>
                    <p className="text-xs text-slate-500">Impact réel (0-10)</p>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    step={1}
                    value={impacts[t.id] ?? ''}
                    onChange={(e) => setImpacts((m) => ({ ...m, [t.id]: e.target.value }))}
                    className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-right"
                  />
                </div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="font-semibold mb-2">Historique hebdomadaire</h3>
            <div className="rounded-lg border border-slate-200 p-3">
              {weeklySummary.length === 0 ? (
                <p className="text-sm text-slate-500">Ajoutez des scores d'impact pour voir l'évolution.</p>
              ) : (
                <ul className="text-sm text-slate-700 space-y-1">
                  {weeklySummary.map((w) => (
                    <li key={w.week} className="flex items-center justify-between">
                      <span>{w.week}</span>
                      <span className="text-slate-500">Livrables: {w.count} · Impact cumulé: {w.impact}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Recommandations automatiques</h3>
            {recommendations.length === 0 ? (
              <p className="text-sm text-slate-500">Livrez et scorez l'impact pour activer les recommandations.</p>
            ) : (
              <ul className="list-disc pl-5 text-sm text-slate-700">
                {recommendations.map((r, i) => (
                  <li key={r.id}>Objectif {i + 1}: ID {r.id} — Score impact/heure: {r.score.toFixed(2)}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
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
