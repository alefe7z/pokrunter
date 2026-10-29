/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ActiveMonster } from '../types/game';
import { MONSTERS_DATABASE } from '../data/monsters';
import { soundManager } from '../audio/soundManager';
import { X, Heart, Shield, Award, Users, Check } from 'lucide-react';

interface PartyModalProps {
  party: ActiveMonster[];
  activePartnerIndex: number;
  onSelectPartner: (index: number) => void;
  onClose: () => void;
}

export const PartyModal: React.FC<PartyModalProps> = ({
  party,
  activePartnerIndex,
  onSelectPartner,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 select-none">
      <div className="relative max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-black text-white">Equipe Pokémon</h2>
            <span className="text-xs text-slate-400 font-semibold">
              ({party.length}/6 Monstros)
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Party Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 my-4 overflow-y-auto pr-1">
          {party.map((mon, idx) => {
            const species = MONSTERS_DATABASE[mon.speciesId];
            const isPartner = activePartnerIndex === idx;
            const hpPercent = Math.max(0, Math.min(100, (mon.currentHp / mon.maxHp) * 100));

            return (
              <div
                key={mon.instanceId}
                className={`p-4 rounded-2xl border transition-all ${
                  isPartner
                    ? 'bg-amber-500/10 border-amber-400/80 shadow-lg'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-xl shadow"
                      style={{ backgroundColor: species?.colorTheme.primary || '#3b82f6' }}
                    >
                      {species?.name[0] || 'M'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm">
                          {mon.nickname}
                        </span>
                        <span className="text-xs font-bold px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                          Lv.{mon.level}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">{species?.category}</span>
                    </div>
                  </div>

                  {isPartner ? (
                    <span className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center gap-1 shadow">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Em Campo</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        onSelectPartner(idx);
                        soundManager.playMonsterCry(mon.speciesId);
                      }}
                      className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all"
                    >
                      Conectar
                    </button>
                  )}
                </div>

                {/* HP Gauge */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>HP</span>
                    <span>
                      {mon.currentHp} / {mon.maxHp}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all ${
                        hpPercent > 50 ? 'bg-emerald-500' : hpPercent > 20 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${hpPercent}%` }}
                    />
                  </div>
                </div>

                {/* Friendship & Stats footer */}
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1 text-pink-400 font-semibold">
                    <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
                    <span>Amizade: {mon.friendship}%</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400">
                    <span>ATK: {mon.stats.attack}</span>
                    <span>DEF: {mon.stats.defense}</span>
                    <span>VEL: {mon.stats.speed}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
