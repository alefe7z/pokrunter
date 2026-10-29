/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ActiveMonster,
  InventoryItem,
  WildMonsterInstance,
} from '../types/game';
import { MOVES_DATABASE } from '../data/moves';
import { MONSTERS_DATABASE } from '../data/monsters';
import { Shield, Crosshair, Heart, Zap, Sparkles } from 'lucide-react';

interface BattleHUDProps {
  partner: ActiveMonster;
  target: WildMonsterInstance | null;
  inventory: InventoryItem[];
  selectedBall: string;
  onSelectBall: (ballId: string) => void;
  onUseMove: (idx: number) => void;
  onDodge: () => void;
  onThrowBall: () => void;
  onCycleTarget: () => void;
  captureStatus: string | null;
  battleLogs: string[];
}

export const BattleHUD: React.FC<BattleHUDProps> = ({
  partner,
  target,
  inventory,
  selectedBall,
  onSelectBall,
  onUseMove,
  onDodge,
  onThrowBall,
  onCycleTarget,
  captureStatus,
  battleLogs,
}) => {
  const hpPercent = Math.max(0, Math.min(100, (partner.currentHp / partner.maxHp) * 100));
  const expPercent = Math.max(0, Math.min(100, (partner.exp / partner.maxExp) * 100));

  // Determine HP bar color
  const hpColorClass =
    hpPercent > 50 ? 'bg-emerald-500' : hpPercent > 20 ? 'bg-amber-500' : 'bg-red-500';

  const balls = inventory.filter((i) => i.category === 'ball');
  const targetSpecies = target ? MONSTERS_DATABASE[target.speciesId] : null;

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 z-20">
      {/* TOP BAR: Partner Info & Target Info */}
      <div className="flex justify-between items-start gap-4">
        {/* Partner Card (Left) */}
        <div className="pointer-events-auto bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 shadow-xl w-72 transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-white tracking-wide">
                {partner.nickname}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-400 text-amber-300 font-black text-xs">
                Lv.{partner.level}
              </span>
            </div>

            {/* Friendship Indicator */}
            <div
              className="flex items-center gap-1 text-pink-400 text-xs font-bold"
              title={`Amizade: ${partner.friendship}%`}
            >
              <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
              <span>{partner.friendship}%</span>
            </div>
          </div>

          {/* HP Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-300">
              <span className="text-[10px] uppercase tracking-wider text-slate-400">HP</span>
              <span>
                {partner.currentHp} / {partner.maxHp}
              </span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-300 ${hpColorClass}`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>

          {/* EXP Bar */}
          <div className="mt-2 space-y-0.5">
            <div className="flex justify-between text-[9px] font-bold text-slate-400">
              <span>EXP</span>
              <span>{Math.floor(expPercent)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                style={{ width: `${expPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Target Info Card (Center-Right if targeted) */}
        {target && targetSpecies && (
          <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-red-500/50 rounded-2xl p-3 shadow-xl w-64 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5 text-red-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span className="font-extrabold text-white text-sm">
                  {targetSpecies.name}
                </span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-red-500/20 border border-red-400 text-red-300 font-bold text-[11px]">
                Lv.{target.level}
              </span>
            </div>

            {/* Target HP Bar */}
            <div className="space-y-1">
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-red-500 rounded-full transition-all duration-200"
                  style={{ width: `${(target.currentHp / target.maxHp) * 100}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span className="capitalize">{targetSpecies.category}</span>
                <span>{Math.floor((target.currentHp / target.maxHp) * 100)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CENTER POPUPS: Capture Status Toast & Battle Logs */}
      <div className="flex flex-col items-center justify-center space-y-2">
        {captureStatus && (
          <div className="pointer-events-auto px-6 py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-black text-sm shadow-2xl border-2 border-white animate-bounce flex items-center gap-2">
            <Sparkles className="w-5 h-5 fill-slate-950 text-slate-950" />
            <span>{captureStatus}</span>
          </div>
        )}

        {/* Recent Battle Log Ticker */}
        {battleLogs.length > 0 && (
          <div className="max-w-md w-full bg-slate-950/80 backdrop-blur-sm border border-slate-800 rounded-xl px-4 py-1.5 text-center shadow-lg">
            <p className="text-xs font-semibold text-slate-200 truncate">
              {battleLogs[battleLogs.length - 1]}
            </p>
          </div>
        )}
      </div>

      {/* BOTTOM ACTION DOCK: Moves, Sphere Quick-Throw, Dodge, Target Switch */}
      <div className="flex flex-col items-center gap-3">
        {/* Sphere Selector Quick Bar */}
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/85 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-full shadow-lg">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">
            Captura:
          </span>
          {balls.map((b) => (
            <button
              key={b.id}
              onClick={() => onSelectBall(b.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                selectedBall === b.id
                  ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <span>{b.name}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-950/20 text-[10px]">
                x{b.quantity}
              </span>
            </button>
          ))}

          <button
            onClick={onThrowBall}
            className="ml-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1"
          >
            <span>Arremessar</span>
            <span className="text-[9px] opacity-75">(E)</span>
          </button>
        </div>

        {/* Moves & Battle Action Buttons */}
        <div className="pointer-events-auto flex items-center gap-2 flex-wrap justify-center">
          {/* Target Cycle Button */}
          <button
            onClick={onCycleTarget}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex flex-col items-center justify-center gap-0.5 shadow-md active:scale-95 transition-all"
            title="Trocar Alvo (TAB / Q)"
          >
            <Crosshair className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px]">Alvo (Q)</span>
          </button>

          {/* 4 Moves */}
          {partner.moves.map((moveId, idx) => {
            const move = MOVES_DATABASE[moveId];
            if (!move) return null;
            const readyAt = partner.moveCooldowns[moveId] || 0;
            const isCooling = Date.now() < readyAt;

            return (
              <button
                key={moveId}
                disabled={isCooling}
                onClick={() => onUseMove(idx)}
                className={`relative px-4 py-2 rounded-2xl border font-bold text-xs flex flex-col items-start gap-0.5 shadow-md active:scale-95 transition-all w-32 ${
                  isCooling
                    ? 'bg-slate-800/60 border-slate-700/60 text-slate-500 cursor-not-allowed'
                    : 'bg-slate-900/95 hover:bg-slate-850 border-slate-700 text-white hover:border-amber-400/60'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="truncate max-w-[80px] font-extrabold">{move.name}</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                    {idx + 1}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: move.color }}
                  />
                  <span className="capitalize">{move.type}</span>
                  <span className="ml-auto font-mono text-amber-300 font-bold">
                    {move.power}P
                  </span>
                </div>
              </button>
            );
          })}

          {/* Dodge Button */}
          <button
            onClick={onDodge}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border border-blue-400/40 text-white font-extrabold text-xs flex flex-col items-center justify-center gap-0.5 shadow-md active:scale-95 transition-all"
            title="Esquivar (Espaço)"
          >
            <Shield className="w-4 h-4 text-white" />
            <span className="text-[10px]">Esquiva (Espaço)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
