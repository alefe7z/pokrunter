/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MONSTERS_DATABASE } from '../data/monsters';
import { soundManager } from '../audio/soundManager';
import { Volume2, X, Sparkles, GitBranch, Shield, Zap } from 'lucide-react';

interface PokedexModalProps {
  onClose: () => void;
  caughtSpecies: string[];
}

export const PokedexModal: React.FC<PokedexModalProps> = ({ onClose, caughtSpecies }) => {
  const speciesList = Object.values(MONSTERS_DATABASE).sort((a, b) => a.dexNumber - b.dexNumber);
  const [selectedId, setSelectedId] = useState<string>(speciesList[0].id);

  const selected = MONSTERS_DATABASE[selectedId];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 select-none">
      <div className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[85vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* LEFT COLUMN: Monster List Grid */}
        <div className="w-full md:w-1/3 bg-slate-950/60 p-4 border-r border-slate-800 flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>PokéDex Costeira</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-400">
              {caughtSpecies.length} / {speciesList.length} Capturados
            </span>
          </div>

          <div className="space-y-1.5 flex-1 pr-1">
            {speciesList.map((m) => {
              const isCaught = caughtSpecies.includes(m.id);
              const isSelected = selectedId === m.id;

              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedId(m.id);
                    soundManager.playMonsterCry(m.id);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                      : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] opacity-75 font-mono">
                      #{m.dexNumber.toString().padStart(3, '0')}
                    </span>
                    <span className="truncate">{m.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isCaught ? (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Pegou
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-500">Visto</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Selected Monster Details */}
        {selected && (
          <div className="w-full md:w-2/3 p-6 overflow-y-auto flex flex-col space-y-6">
            {/* Header info */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400">
                  No. {selected.dexNumber.toString().padStart(3, '0')}
                </span>
                <h2 className="text-2xl font-black text-white">{selected.name}</h2>
                <p className="text-xs font-semibold text-slate-400">{selected.category}</p>
              </div>

              {/* Typing Badges */}
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {selected.primaryType}
                </span>
                {selected.secondaryType && (
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    {selected.secondaryType}
                  </span>
                )}

                <button
                  onClick={() => soundManager.playMonsterCry(selected.id)}
                  className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all shadow"
                  title="Ouvir Rugido"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Visual Display Box */}
            <div
              className="w-full h-40 rounded-2xl flex items-center justify-center relative overflow-hidden border border-slate-800 shadow-inner"
              style={{
                backgroundColor: `${selected.colorTheme.primary}20`,
              }}
            >
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center shadow-2xl border-2"
                style={{
                  backgroundColor: selected.colorTheme.primary,
                  borderColor: selected.colorTheme.accent,
                }}
              >
                <span className="text-5xl font-black text-white">
                  {selected.name[0]}
                </span>
              </div>
              <div className="absolute bottom-2 left-4 text-[10px] text-slate-400 flex gap-4">
                <span>Altura: {selected.height}</span>
                <span>Peso: {selected.weight}</span>
              </div>
            </div>

            {/* Lore */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              {selected.description}
            </div>

            {/* Base Stats Bars */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Estatísticas Básicas
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {Object.entries(selected.baseStats).map(([stat, val]) => (
                  <div key={stat} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-300 capitalize">
                      <span>{stat}</span>
                      <span className="font-mono text-amber-300">{val}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${Math.min(100, (val / 140) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Evolution Pathways Tree (Complex Evolution System!) */}
            <div className="pt-2 border-t border-slate-800">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
                <GitBranch className="w-4 h-4 text-cyan-400" />
                <span>Ramificações de Evolução</span>
              </h4>

              {selected.evolutions.length === 0 ? (
                <p className="text-xs text-slate-500 italic">
                  Esta espécie atingiu o ápice de sua linhagem evolutiva.
                </p>
              ) : (
                <div className="space-y-2">
                  {selected.evolutions.map((evo, i) => {
                    const target = MONSTERS_DATABASE[evo.targetSpeciesId];
                    return (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-extrabold text-amber-300">
                            ➔ {target?.name || evo.targetSpeciesId}
                          </div>
                          <div className="text-[11px] text-slate-400">{evo.description}</div>
                        </div>

                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-400/30 capitalize">
                          {evo.trigger}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
