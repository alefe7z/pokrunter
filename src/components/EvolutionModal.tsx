/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveMonster } from '../types/game';
import { MONSTERS_DATABASE } from '../data/monsters';
import { soundManager } from '../audio/soundManager';
import { Sparkles, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

interface EvolutionModalProps {
  partner: ActiveMonster;
  targetSpeciesId: string;
  onComplete: (evolvedSpeciesId: string) => void;
  onCancel: () => void;
}

export const EvolutionModal: React.FC<EvolutionModalProps> = ({
  partner,
  targetSpeciesId,
  onComplete,
  onCancel,
}) => {
  const [phase, setPhase] = useState<'intro' | 'evolving' | 'revealed'>('intro');
  const currentSpecies = MONSTERS_DATABASE[partner.speciesId];
  const evolvedSpecies = MONSTERS_DATABASE[targetSpeciesId];

  useEffect(() => {
    // Play dramatic evolution theme
    soundManager.playEvolutionChime();

    // Sequence timer: intro (2s) -> transforming (3.5s) -> revealed
    const t1 = setTimeout(() => {
      setPhase('evolving');
    }, 1800);

    const t2 = setTimeout(() => {
      setPhase('revealed');
      soundManager.playCatchSuccess();
      soundManager.playMonsterCry(targetSpeciesId);
    }, 5500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [targetSpeciesId]);

  if (!currentSpecies || !evolvedSpecies) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl select-none">
      {/* Dynamic 3DS Celestial Glow Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-600/30 via-indigo-500/40 to-pink-500/30 rounded-full blur-3xl animate-pulse" />
        {phase === 'evolving' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[800px] h-[800px] rounded-full border-4 border-dashed border-cyan-400/50 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
        )}
      </div>

      <div className="relative z-10 max-w-xl w-full mx-4 flex flex-col items-center text-center p-8 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl">
        {/* Banner Title */}
        <div className="mb-6">
          <span className="px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400 text-indigo-300 font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 mx-auto w-fit">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Sistema de Evolução Pokémon 3DS</span>
          </span>
          <h2 className="text-2xl font-black text-white mt-3">
            {phase === 'intro' && `O quê?! ${partner.nickname} está reagindo!`}
            {phase === 'evolving' && `A energia vital está transformando o corpo...`}
            {phase === 'revealed' && `Parabéns! ${partner.nickname} evoluiu para ${evolvedSpecies.name}!`}
          </h2>
        </div>

        {/* Monster Transformation Spotlight */}
        <div className="relative w-64 h-64 my-4 flex items-center justify-center">
          {/* Spotlight Circle */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-indigo-500/20 to-slate-900/80 border border-indigo-400/30 flex items-center justify-center" />

          {/* Morphing Silhouette */}
          {phase === 'intro' && (
            <div className="relative z-10 flex flex-col items-center animate-pulse">
              <div
                className="w-32 h-32 rounded-3xl flex items-center justify-center shadow-lg border-2"
                style={{
                  backgroundColor: currentSpecies.colorTheme.primary,
                  borderColor: currentSpecies.colorTheme.accent,
                }}
              >
                <span className="text-5xl font-black text-white/90">
                  {currentSpecies.name[0]}
                </span>
              </div>
              <p className="mt-3 font-extrabold text-slate-300 text-base">
                {currentSpecies.name}
              </p>
            </div>
          )}

          {phase === 'evolving' && (
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-36 h-36 rounded-full bg-white shadow-[0_0_60px_#fff] flex items-center justify-center animate-ping" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-950 font-black text-xl">
                ⚡
              </div>
            </div>
          )}

          {phase === 'revealed' && (
            <div className="relative z-10 flex flex-col items-center animate-in zoom-in-75 duration-700">
              <div
                className="w-36 h-36 rounded-3xl flex items-center justify-center shadow-[0_0_35px_rgba(251,191,36,0.6)] border-4 border-amber-400"
                style={{
                  backgroundColor: evolvedSpecies.colorTheme.primary,
                }}
              >
                <span className="text-6xl font-black text-white">
                  {evolvedSpecies.name[0]}
                </span>
              </div>
              <p className="mt-3 font-black text-amber-300 text-xl tracking-wide flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5 text-amber-400" />
                <span>{evolvedSpecies.name}</span>
              </p>
              <span className="text-xs font-semibold text-slate-400">
                {evolvedSpecies.category}
              </span>
            </div>
          )}
        </div>

        {/* Stat Increase Comparison (Shown when revealed) */}
        {phase === 'revealed' && (
          <div className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl p-4 mt-2 mb-6">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
              Aumento de Atributos Básicos
            </h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-slate-400 text-[10px]">HP Máximo</div>
                <div className="font-extrabold text-emerald-400 flex items-center justify-center gap-1">
                  <span>{currentSpecies.baseStats.hp}</span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span>{evolvedSpecies.baseStats.hp}</span>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Ataque</div>
                <div className="font-extrabold text-amber-400 flex items-center justify-center gap-1">
                  <span>{currentSpecies.baseStats.attack}</span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span>{evolvedSpecies.baseStats.attack}</span>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Velocidade</div>
                <div className="font-extrabold text-cyan-400 flex items-center justify-center gap-1">
                  <span>{currentSpecies.baseStats.speed}</span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span>{evolvedSpecies.baseStats.speed}</span>
                </div>
              </div>
            </div>

            {/* Learned Moves */}
            <div className="mt-3 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
              <span className="font-bold text-amber-400">Novos Golpes Despertados: </span>
              <span>{evolvedSpecies.moves.join(', ')}</span>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-4 mt-2">
          {phase !== 'revealed' ? (
            <button
              onClick={onCancel}
              className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all border border-slate-700"
            >
              Cancelar Evolução (Botão B)
            </button>
          ) : (
            <button
              onClick={() => onComplete(targetSpeciesId)}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-xl active:scale-95 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5 fill-slate-950 text-amber-400" />
              <span>Continuar Aventura</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
