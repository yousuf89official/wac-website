'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Power, X, Check } from 'lucide-react';
import type { AlertRule } from '@/types';

const severityColors: Record<string, string> = {
  critical: 'bg-red-500/15 text-red-400',
  high: 'bg-orange-500/15 text-orange-400',
  medium: 'bg-yellow-500/15 text-yellow-400',
  low: 'bg-blue-500/15 text-blue-400',
};

const emptyRule = { name: '', severity: 'medium', threshold: 0, channels: '' };

export default function AlertRulesManager({ data }: { data: AlertRule[] }) {
  const [rules, setRules] = useState(data);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRule, setNewRule] = useState(emptyRule);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ name: string; severity: string; threshold: number }>({ name: '', severity: '', threshold: 0 });

  const toggleRule = (id: string) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };

  const deleteRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const startEdit = (rule: AlertRule) => {
    setEditingId(rule.id);
    setEditValues({ name: rule.name, severity: rule.severity, threshold: rule.threshold as number });
  };

  const saveEdit = (id: string) => {
    setRules((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, name: editValues.name, severity: editValues.severity as AlertRule['severity'], threshold: editValues.threshold }
          : r
      )
    );
    setEditingId(null);
  };

  const handleAddRule = () => {
    if (!newRule.name.trim()) return;
    const rule: AlertRule = {
      id: `rule-${Date.now()}`,
      name: newRule.name,
      condition: 'mentions',
      severity: newRule.severity as AlertRule['severity'],
      threshold: newRule.threshold || 0,
      channels: newRule.channels ? newRule.channels.split(',').map((c) => c.trim()) : ['Email'],
      enabled: true,
    };
    setRules((prev) => [...prev, rule]);
    setNewRule(emptyRule);
    setShowAddForm(false);
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-display font-semibold text-lens-text">Alert Rules</h3>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-lens-accent/15 text-lens-accent hover:bg-lens-accent/25 transition-colors"
        >
          <Plus size={12} /> Add Rule
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-lens-text-muted border-b border-lens-border">
              <th className="text-left pb-2 font-medium">Rule Name</th>
              <th className="text-left pb-2 font-medium">Severity</th>
              <th className="text-left pb-2 font-medium">Threshold</th>
              <th className="text-left pb-2 font-medium">Channels</th>
              <th className="text-center pb-2 font-medium">Status</th>
              <th className="text-right pb-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-lens-border">
            {rules.map((rule) =>
              editingId === rule.id ? (
                <tr key={rule.id}>
                  <td className="py-2">
                    <input
                      value={editValues.name}
                      onChange={(e) => setEditValues((v) => ({ ...v, name: e.target.value }))}
                      className="input-field w-full text-xs py-1"
                    />
                  </td>
                  <td className="py-2">
                    <select
                      value={editValues.severity}
                      onChange={(e) => setEditValues((v) => ({ ...v, severity: e.target.value }))}
                      className="input-field text-xs py-1"
                    >
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </td>
                  <td className="py-2">
                    <input
                      type="number"
                      value={editValues.threshold}
                      onChange={(e) => setEditValues((v) => ({ ...v, threshold: Number(e.target.value) }))}
                      className="input-field w-full text-xs py-1"
                    />
                  </td>
                  <td className="py-2 text-lens-text-secondary">{rule.channels.join(', ')}</td>
                  <td />
                  <td className="py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => saveEdit(rule.id)}
                        className="p-1 rounded hover:bg-green-500/20 text-green-400 transition-colors"
                      >
                        <Check size={12} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 rounded hover:bg-slate-700 text-lens-text-muted transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={rule.id} className={`${rule.enabled ? '' : 'opacity-50'}`}>
                  <td className="py-2.5 text-lens-text font-medium">{rule.name}</td>
                  <td className="py-2.5">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium capitalize ${severityColors[rule.severity]}`}>
                      {rule.severity}
                    </span>
                  </td>
                  <td className="py-2.5 text-lens-text-secondary">{rule.threshold}</td>
                  <td className="py-2.5 text-lens-text-secondary">{rule.channels.join(', ')}</td>
                  <td className="py-2.5 text-center">
                    <button
                      onClick={() => toggleRule(rule.id)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                        rule.enabled ? 'bg-green-500/15 text-green-400' : 'bg-slate-600/15 text-slate-400'
                      }`}
                    >
                      <Power size={10} />
                      {rule.enabled ? 'Active' : 'Off'}
                    </button>
                  </td>
                  <td className="py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => startEdit(rule)}
                        className="p-1 rounded hover:bg-slate-700 text-lens-text-muted transition-colors"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => deleteRule(rule.id)}
                        className="p-1 rounded hover:bg-red-500/20 text-lens-text-muted hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Add Rule inline form */}
      {showAddForm && (
        <div className="mt-4 p-3 rounded-lg border border-dashed border-lens-border bg-lens-bg/30">
          <p className="text-xs font-semibold text-lens-text mb-3">New Alert Rule</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-lens-text-muted block mb-1">Rule Name</label>
              <input
                type="text"
                value={newRule.name}
                onChange={(e) => setNewRule((v) => ({ ...v, name: e.target.value }))}
                className="input-field w-full text-xs"
                placeholder="e.g. Viral Negative Thread"
              />
            </div>
            <div>
              <label className="text-[10px] text-lens-text-muted block mb-1">Severity</label>
              <select
                value={newRule.severity}
                onChange={(e) => setNewRule((v) => ({ ...v, severity: e.target.value }))}
                className="input-field w-full text-xs"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-lens-text-muted block mb-1">Threshold (mentions)</label>
              <input
                type="number"
                value={newRule.threshold || ''}
                onChange={(e) => setNewRule((v) => ({ ...v, threshold: Number(e.target.value) }))}
                className="input-field w-full text-xs"
                placeholder="e.g. 100"
              />
            </div>
            <div>
              <label className="text-[10px] text-lens-text-muted block mb-1">Channels (comma-separated)</label>
              <input
                type="text"
                value={newRule.channels}
                onChange={(e) => setNewRule((v) => ({ ...v, channels: e.target.value }))}
                className="input-field w-full text-xs"
                placeholder="Email, Slack, WhatsApp"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleAddRule} className="btn-primary text-xs flex-1">Add Rule</button>
            <button onClick={() => { setShowAddForm(false); setNewRule(emptyRule); }} className="btn-secondary text-xs px-4">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
