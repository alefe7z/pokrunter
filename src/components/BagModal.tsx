/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ActiveMonster, InventoryItem } from '../types/game';
import { MONSTERS_DATABASE } from '../data/monsters';
import { soundManager } from '../audio/soundManager';
import { X, Backpack, Sparkles, Heart, Zap } from 'lucide-react';

interface BagModalProps {
  inventory: InventoryItem[];
  partner: ActiveMonster;
  onUsePotion: (item: InventoryItem) => void;
  onUseBerry: (item: InventoryItem) => void;
  onUseStone: (item: InventoryItem, targetSpeciesId: string) => void;
  onClose: () => void;
}

export const BagModal: React.FC<BagModalProps> = ({
  inventory,
  partner,
  onUsePotion,
  onUseBerry,
  onUseStone,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'ball' | 'medicine' | 'stone' | 'berry'>('ball');

  const filteredItems = inventory.filter((item) => {
    if (activeTab === 'medicine') return item.category === 'medicine' || item.category === 'berry';
    return item.category === activeTab;
  });

  const checkStoneEvolution = (stoneId: string): string | null => {
    const species = MONSTERS_DATABASE[partner.speciesId];
    if (!species) return null;
    const evo = species.evolutions.find((e) => e.trigger === 'stone' && e.requiredItem === stoneId);
    return evo ? evo.targetSpeciesId : null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 select-none">
      <div className="relative max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Backpack className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-black text-white">Mochila do Treinador</h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 my-4 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('ball')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'ball'
                ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Esferas
          </button>
          <button
            onClick={() => setActiveTab('medicine')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'medicine'
                ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Remédios & Frutas
          </button>
          <button
            onClick={() => setActiveTab('stone')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'stone'
                ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Pedras Evolutivas
          </button>
        </div>

        {/* Item List */}
        <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              Nenhum item nesta seção da mochila.
            </div>
          ) : (
            filteredItems.map((item) => {
              const targetEvolution = item.category === 'stone' ? checkStoneEvolution(item.id) : null;

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.category === 'ball' && '⚾'}
                      {item.category === 'medicine' && '🧪'}
                      {item.category === 'berry' && '🍓'}
                      {item.category === 'stone' && '💎'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white">
                          {item.name}
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-300 px-1.5 py-0.2 rounded bg-slate-800">
                          x{item.quantity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div>
                    {item.category === 'medicine' && (
                      <button
                        disabled={item.quantity <= 0 || partner.currentHp >= partner.maxHp}
                        onClick={() => onUsePotion(item)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                          item.quantity > 0 && partner.currentHp < partner.maxHp
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        Curar (+{item.healAmount} HP)
                      </button>
                    )}

                    {item.category === 'berry' && (
                      <button
                        disabled={item.quantity <= 0}
                        onClick={() => onUseBerry(item)}
                        className="px-3 py-1.5 rounded-xl font-bold text-xs bg-pink-500 hover:bg-pink-400 text-white shadow-md transition-all flex items-center gap-1"
                      >
                        <Heart className="w-3 h-3 fill-white" />
                        <span>Alimentar</span>
                      </button>
                    )}

                    {item.category === 'stone' && (
                      <button
                        disabled={item.quantity <= 0 || !targetEvolution}
                        onClick={() => targetEvolution && onUseStone(item, targetEvolution)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                          targetEvolution && item.quantity > 0
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 shadow-lg animate-pulse'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                        title={
                          targetEvolution
                            ? `Compatível com ${partner.nickname}!`
                            : `Incompatível com ${partner.nickname}`
                        }
                      >
                        {targetEvolution ? '⚡ Despertar Evolução' : 'Incompatível'}
                      </button>
                    )}

                    {item.category === 'ball' && (
                      <span className="text-[11px] text-slate-500 italic pr-2">
                        Usar em batalha (E)
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
