/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Compass, Flame, Droplets, Leaf, Zap, Sparkles } from 'lucide-react';
import { MONSTERS_DATABASE } from '../data/monsters';

interface MinimapProps {
  playerX: number;
  playerZ: number;
  playerRot: number;
  monsters: { id: string; speciesId: string; x: number; z: number; hpPercent: number }[];
}

export const Minimap: React.FC<MinimapProps> = ({ playerX, playerZ, playerRot, monsters }) => {
  const radarRadius = 68; // pixels
  const worldScale = 1.35; // world units to minimap pixels

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'fire':
        return <Flame className="w-2.5 h-2.5 text-orange-500 fill-orange-500" />;
      case 'water':
        return <Droplets className="w-2.5 h-2.5 text-blue-500 fill-blue-500" />;
      case 'grass':
        return <Leaf className="w-2.5 h-2.5 text-emerald-500 fill-emerald-500" />;
      case 'electric':
        return <Zap className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />;
      default:
        return <Sparkles className="w-2.5 h-2.5 text-purple-400 fill-purple-400" />;
    }
  };

  return (
    <div className="relative w-40 h-40 select-none">
      {/* Outer Golden / Cyan Ring matching the reference screenshot */}
      <div className="absolute inset-0 rounded-full border-[3.5px] border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)] bg-gradient-to-br from-emerald-800/90 via-teal-900/90 to-blue-950/95 overflow-hidden backdrop-blur-sm">
        {/* Stylized Topographic Map Background with Coastline */}
        <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 160 160">
          {/* Landmass contour */}
          <path
            d="M 10 160 Q 40 100 70 85 T 120 40 T 160 30 L 160 160 Z"
            fill="#15803d"
            opacity="0.4"
          />
          {/* Beach coast line */}
          <path
            d="M 20 160 Q 50 105 80 90 T 130 45 T 160 35"
            stroke="#fef08a"
            strokeWidth="3.5"
            fill="none"
          />
          {/* Ocean waves lines */}
          <path
            d="M 60 140 Q 90 120 130 90"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            fill="none"
          />
          <path
            d="M 100 150 Q 130 130 155 110"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            fill="none"
          />
        </svg>

        {/* Center Grid Lines */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-full h-[1px] bg-white"></div>
          <div className="h-full w-[1px] bg-white absolute"></div>
          <div className="w-24 h-24 rounded-full border border-dashed border-white absolute"></div>
        </div>

        {/* Professor's Lab Marker */}
        {(() => {
          const labDx = (12 - playerX) * worldScale;
          const labDz = (-22 - playerZ) * worldScale;
          const dist = Math.hypot(labDx, labDz);
          if (dist < radarRadius - 6) {
            return (
              <div
                className="absolute z-10 w-4 h-4 -ml-2 -mt-2 bg-blue-500 rounded border-2 border-white shadow flex items-center justify-center text-[8px] font-bold text-white"
                style={{
                  left: `calc(50% + ${labDx}px)`,
                  top: `calc(50% + ${labDz}px)`,
                }}
                title="Laboratório Costeiro"
              >
                🏛️
              </div>
            );
          }
          return null;
        })()}

        {/* Wild Monster Blips on Radar */}
        {monsters.map((m) => {
          const dx = (m.x - playerX) * worldScale;
          const dz = (m.z - playerZ) * worldScale;
          const dist = Math.hypot(dx, dz);

          // Only show if inside radar radius
          if (dist > radarRadius - 8) return null;

          const species = MONSTERS_DATABASE[m.speciesId];

          return (
            <div
              key={m.id}
              className="absolute z-10 w-4 h-4 -ml-2 -mt-2 rounded-full border border-white shadow-sm flex items-center justify-center bg-slate-900/90 transition-transform duration-200"
              style={{
                left: `calc(50% + ${dx}px)`,
                top: `calc(50% + ${dz}px)`,
              }}
              title={`${species?.name || 'Monstro'} Selvagem`}
            >
              {getElementIcon(species?.primaryType || 'normal')}
            </div>
          );
        })}

        {/* Player Icon at center with directional view cone */}
        <div className="absolute left-1/2 top-1/2 -ml-3 -mt-3 w-6 h-6 z-20 flex items-center justify-center">
          {/* Directional cone */}
          <div
            className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[14px] border-b-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] filter transition-transform duration-75"
            style={{
              transform: `rotate(${playerRot * (180 / Math.PI) + 180}deg)`,
            }}
          />
          {/* Blue center player dot */}
          <div className="absolute w-2.5 h-2.5 bg-blue-500 border border-white rounded-full shadow" />
        </div>
      </div>

      {/* North Compass Badge */}
      <div className="absolute -top-1.5 left-2 z-30 flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 border-2 border-emerald-400 shadow text-emerald-400 font-extrabold text-[10px]">
        N
      </div>

      {/* Mini Radar Tag */}
      <div className="absolute -bottom-2 right-1 z-30 px-2 py-0.5 rounded-full bg-slate-900/90 border border-amber-400 text-[9px] font-bold text-amber-300 shadow">
        RADAR
      </div>
    </div>
  );
};
