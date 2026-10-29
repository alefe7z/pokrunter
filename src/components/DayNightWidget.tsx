/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TimeOfDayData, TimePhase } from '../types/game';
import {
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Clock,
  Play,
  Pause,
  FastForward,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';

interface DayNightWidgetProps {
  timeData: TimeOfDayData;
  onSetTimeOfDay: (hours: number) => void;
  onSetTimeSpeed: (multiplier: number) => void;
  onTogglePause: () => boolean;
  isPaused: boolean;
  currentSpeed: number;
}

export const DayNightWidget: React.FC<DayNightWidgetProps> = ({
  timeData,
  onSetTimeOfDay,
  onSetTimeSpeed,
  onTogglePause,
  isPaused,
  currentSpeed,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Phase icon and colors
  const getPhaseIcon = (phase: TimePhase) => {
    switch (phase) {
      case 'dawn':
        return <Sunrise className="w-4 h-4 text-pink-400 animate-pulse" />;
      case 'day':
        return <Sun className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '24s' }} />;
      case 'dusk':
        return <Sunset className="w-4 h-4 text-orange-400 animate-pulse" />;
      case 'night':
        return <Moon className="w-4 h-4 text-cyan-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]" />;
    }
  };

  const getPhaseBadgeStyle = (phase: TimePhase) => {
    switch (phase) {
      case 'dawn':
        return 'from-pink-500/20 to-amber-500/20 border-pink-400/40 text-pink-200';
      case 'day':
        return 'from-sky-500/20 to-amber-500/20 border-sky-400/40 text-amber-200';
      case 'dusk':
        return 'from-purple-500/20 to-orange-500/20 border-orange-400/40 text-orange-200';
      case 'night':
        return 'from-indigo-950/60 to-slate-900/60 border-cyan-500/40 text-cyan-200';
    }
  };

  const speedOptions = [
    { label: '1x', mult: 1 },
    { label: '4x', mult: 4 },
    { label: '12x', mult: 12 },
  ];

  return (
    <div className="pointer-events-auto flex flex-col items-center select-none font-sans">
      {/* Primary Compact Badge */}
      <div
        onClick={() => setIsExpanded((prev) => !prev)}
        className={`cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-gradient-to-r backdrop-blur-md border shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 ${getPhaseBadgeStyle(
          timeData.phase
        )} bg-slate-900/85 border-slate-700/80`}
        title="Clique para ajustar o ciclo de tempo e iluminação"
      >
        {/* Dynamic Celestial Icon */}
        <div className="flex items-center justify-center p-1 rounded-xl bg-slate-950/60 border border-white/10 shadow-inner">
          {getPhaseIcon(timeData.phase)}
        </div>

        {/* Digital Time & Phase Name */}
        <div className="flex flex-col text-left leading-none">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-extrabold text-sm tracking-wider text-white">
              {timeData.formattedTime}
            </span>
            {isPaused && (
              <span className="text-[9px] px-1 rounded bg-amber-500/30 text-amber-300 border border-amber-500/50 font-bold">
                PAUSA
              </span>
            )}
            {!isPaused && currentSpeed > 1 && (
              <span className="text-[9px] px-1 rounded bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 font-bold">
                {currentSpeed}x
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mt-0.5">
            {timeData.phaseName}
          </span>
        </div>

        {/* Expand / Collapse Indicator */}
        <div className="text-slate-400 pl-0.5">
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </div>

      {/* Expanded Quick Time-Skip & Speed Controls Drawer */}
      {isExpanded && (
        <div className="mt-2 w-72 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 shadow-2xl space-y-2.5 animate-in fade-in slide-in-from-top-2 text-xs">
          <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-200 font-extrabold">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Controle do Ciclo Solar</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePause();
              }}
              className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 flex items-center gap-1 font-bold text-[10px]"
            >
              {isPaused ? <Play className="w-2.5 h-2.5 text-emerald-400" /> : <Pause className="w-2.5 h-2.5 text-amber-400" />}
              <span>{isPaused ? 'Continuar' : 'Pausar'}</span>
            </button>
          </div>

          {/* Quick Preset Buttons (Jump between Dawn, Day, Sunset, Night) */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Saltar Horário:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSetTimeOfDay(6.25);
                }}
                className={`px-2 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold text-[11px] transition-all ${
                  timeData.phase === 'dawn'
                    ? 'bg-pink-600/30 border-pink-400 text-pink-200 shadow-md'
                    : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300'
                }`}
              >
                <Sunrise className="w-3.5 h-3.5 text-pink-400" />
                <span>Alvorecer (06h)</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSetTimeOfDay(12.0);
                }}
                className={`px-2 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold text-[11px] transition-all ${
                  timeData.phase === 'day'
                    ? 'bg-amber-600/30 border-amber-400 text-amber-200 shadow-md'
                    : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Pleno Dia (12h)</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSetTimeOfDay(18.5);
                }}
                className={`px-2 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold text-[11px] transition-all ${
                  timeData.phase === 'dusk'
                    ? 'bg-orange-600/30 border-orange-400 text-orange-200 shadow-md'
                    : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300'
                }`}
              >
                <Sunset className="w-3.5 h-3.5 text-orange-400" />
                <span>Pôr do Sol (18h)</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSetTimeOfDay(23.0);
                }}
                className={`px-2 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold text-[11px] transition-all ${
                  timeData.phase === 'night'
                    ? 'bg-cyan-600/30 border-cyan-400 text-cyan-200 shadow-md'
                    : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-cyan-300" />
                <span>Noite (23h)</span>
              </button>
            </div>
          </div>

          {/* Time Speed Multiplier */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <FastForward className="w-3 h-3 text-cyan-400" />
              Velocidade:
            </span>
            <div className="flex items-center gap-1">
              {speedOptions.map((opt) => (
                <button
                  key={opt.mult}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetTimeSpeed(opt.mult);
                  }}
                  className={`px-2 py-0.5 rounded-lg font-mono font-bold text-[11px] border transition-all ${
                    currentSpeed === opt.mult
                      ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-sm'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
