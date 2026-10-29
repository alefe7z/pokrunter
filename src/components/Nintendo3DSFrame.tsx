/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, Backpack, Users, Volume2, VolumeX, Maximize2, Minimize2, Sparkles } from 'lucide-react';

interface Nintendo3DSFrameProps {
  is3DSMode: boolean;
  onToggle3DSMode: () => void;
  onOpenDex: () => void;
  onOpenBag: () => void;
  onOpenParty: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  children: React.ReactNode;
}

export const Nintendo3DSFrame: React.FC<Nintendo3DSFrameProps> = ({
  is3DSMode,
  onToggle3DSMode,
  onOpenDex,
  onOpenBag,
  onOpenParty,
  isMuted,
  onToggleMute,
  children,
}) => {
  if (!is3DSMode) {
    // Modern Fullscreen Mode
    return (
      <div className="relative w-screen h-screen overflow-hidden bg-slate-950">
        {children}

        {/* Top-Right HUD Navigation Buttons */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          <button
            onClick={onOpenDex}
            className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white font-extrabold text-xs shadow-lg backdrop-blur-md flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>PokéDex</span>
          </button>

          <button
            onClick={onOpenParty}
            className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white font-extrabold text-xs shadow-lg backdrop-blur-md flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Equipe</span>
          </button>

          <button
            onClick={onOpenBag}
            className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white font-extrabold text-xs shadow-lg backdrop-blur-md flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <Backpack className="w-4 h-4 text-amber-400" />
            <span>Mochila</span>
          </button>

          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 shadow-lg backdrop-blur-md transition-all"
            title={isMuted ? 'Ativar Som' : 'Silenciar'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-green-400" />}
          </button>

          <button
            onClick={onToggle3DSMode}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-lg flex items-center gap-1.5 transition-all"
            title="Alternar Modo Nintendo 3DS Dual Screen"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Modo 3DS</span>
          </button>
        </div>
      </div>
    );
  }

  // Nintendo 3DS XL Dual Screen Hardware Shell Mode
  return (
    <div className="w-screen h-screen bg-slate-950 flex items-center justify-center p-2 select-none overflow-hidden font-sans">
      {/* 3DS Metallic Chassis Container */}
      <div className="relative max-w-4xl w-full h-[96vh] max-h-[880px] bg-gradient-to-b from-red-800 via-rose-900 to-red-950 rounded-[40px] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(255,255,255,0.4)] border-4 border-red-700/60 flex flex-col justify-between items-center">
        {/* TOP SCREEN CHASSIS (Stereoscopic 3D Screen) */}
        <div className="w-full flex-1 min-h-0 bg-slate-900 rounded-3xl p-3 border-2 border-slate-800/80 shadow-inner flex flex-col relative overflow-hidden">
          {/* 3D Top Bezel Status Header */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 pb-1 px-2 border-b border-slate-800/50">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-red-400 tracking-wider">Nintendo 3DS XL</span>
              <span className="text-slate-600">|</span>
              <span className="text-emerald-400 font-bold">Cel-Shading 3D Ativo</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-amber-400 font-mono font-bold">60 FPS</span>
              <div className="w-5 h-2.5 rounded border border-slate-600 flex items-center p-0.5">
                <div className="w-3 h-full bg-emerald-400 rounded-sm" />
              </div>
            </div>
          </div>

          {/* 3D Game Canvas Mount Area */}
          <div className="relative w-full flex-1 rounded-2xl overflow-hidden mt-1.5 shadow-2xl border border-slate-950">
            {children}
          </div>
        </div>

        {/* 3DS Hinge Bar */}
        <div className="w-48 h-3.5 my-1.5 rounded-full bg-gradient-to-r from-red-950 via-slate-800 to-red-950 border border-red-900 shadow-inner flex items-center justify-center">
          <div className="w-24 h-1 bg-slate-900/60 rounded-full" />
        </div>

        {/* BOTTOM SCREEN (Touch Screen + Stylus Buttons) */}
        <div className="w-full max-w-xl h-52 bg-slate-900 rounded-3xl p-3 border-2 border-slate-800 shadow-inner flex flex-col justify-between">
          <div className="flex items-center justify-between px-2 text-[10px] text-slate-400">
            <span className="font-bold text-amber-400">TOUCH SCREEN (Menu Inferior)</span>
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleMute}
                className="hover:text-white"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
              <button
                onClick={onToggle3DSMode}
                className="flex items-center gap-1 hover:text-white"
                title="Tela Cheia"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Cheia</span>
              </button>
            </div>
          </div>

          {/* Touchscreen Stylus App Grid */}
          <div className="grid grid-cols-3 gap-3 my-auto px-2">
            <button
              onClick={onOpenDex}
              className="p-3 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-extrabold text-xs shadow-md border border-cyan-400/40 flex flex-col items-center justify-center gap-1 active:scale-95 transition-all"
            >
              <BookOpen className="w-5 h-5 text-cyan-200" />
              <span>PokéDex</span>
            </button>

            <button
              onClick={onOpenParty}
              className="p-3 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold text-xs shadow-md border border-emerald-400/40 flex flex-col items-center justify-center gap-1 active:scale-95 transition-all"
            >
              <Users className="w-5 h-5 text-emerald-200" />
              <span>Equipe</span>
            </button>

            <button
              onClick={onOpenBag}
              className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs shadow-md border border-amber-300/60 flex flex-col items-center justify-center gap-1 active:scale-95 transition-all"
            >
              <Backpack className="w-5 h-5 text-slate-950" />
              <span>Mochila</span>
            </button>
          </div>

          {/* Bottom Stylus Hint Bar */}
          <div className="text-center text-[10px] text-slate-500 font-semibold">
            Toque nos botões ou use [WASD / Mouse / Teclado 1-4] para explorar e batalhar
          </div>
        </div>
      </div>
    </div>
  );
};
