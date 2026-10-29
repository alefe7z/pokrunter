/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/GameEngine';
import {
  ActiveMonster,
  FloatingDamage,
  InventoryItem,
  WildMonsterInstance,
} from './types/game';
import { createInitialMonster, INITIAL_INVENTORY, MONSTERS_DATABASE } from './data/monsters';
import { soundManager } from './audio/soundManager';
import { Minimap } from './components/Minimap';
import { BattleHUD } from './components/BattleHUD';
import { EvolutionModal } from './components/EvolutionModal';
import { PokedexModal } from './components/PokedexModal';
import { PartyModal } from './components/PartyModal';
import { BagModal } from './components/BagModal';
import { Nintendo3DSFrame } from './components/Nintendo3DSFrame';
import { HelpCircle, ChevronUp, ChevronDown } from 'lucide-react';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Game States
  const [party, setParty] = useState<ActiveMonster[]>(() => [
    createInitialMonster('flameling', 5, 'Flameling'),
    createInitialMonster('bubblot', 4, 'Bubblot'),
  ]);
  const [activePartnerIndex, setActivePartnerIndex] = useState<number>(0);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [selectedBall, setSelectedBall] = useState<string>('poke_sphere');
  const [caughtSpecies, setCaughtSpecies] = useState<string[]>(['flameling', 'bubblot']);

  // Minimap State
  const [minimapData, setMinimapData] = useState<{
    playerX: number;
    playerZ: number;
    playerRot: number;
    monsters: { id: string; speciesId: string; x: number; z: number; hpPercent: number }[];
  }>({
    playerX: 0,
    playerZ: 15,
    playerRot: Math.PI,
    monsters: [],
  });

  // Battle & Target State
  const [currentTarget, setCurrentTarget] = useState<WildMonsterInstance | null>(null);
  const [floatingDamages, setFloatingDamages] = useState<FloatingDamage[]>([]);
  const [captureStatus, setCaptureStatus] = useState<string | null>(null);
  const [battleLogs, setBattleLogs] = useState<string[]>([
    'Bem-vindo à Região Costeira de PokeRealm!',
    'Explore o litoral, encontre monstros selvagens e torne-se o maior mestre!',
  ]);

  // Evolution modal trigger
  const [pendingEvolution, setPendingEvolution] = useState<{
    partner: ActiveMonster;
    targetSpeciesId: string;
  } | null>(null);

  // Modals & 3DS Bezel
  const [isDexOpen, setIsDexOpen] = useState(false);
  const [isPartyOpen, setIsPartyOpen] = useState(false);
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [is3DSMode, setIs3DSMode] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isBottomDockCollapsed, setIsBottomDockCollapsed] = useState(false);

  const activePartner = party[activePartnerIndex] || party[0];

  // Callbacks for 3D GameEngine
  const handleMinimapUpdate = useCallback((data: any) => {
    setMinimapData(data);
  }, []);

  const handleTargetChanged = useCallback((m: WildMonsterInstance | null) => {
    setCurrentTarget(m);
  }, []);

  const handleDamageNumber = useCallback((dmg: FloatingDamage) => {
    setFloatingDamages((prev) => [...prev.slice(-6), dmg]);
    setTimeout(() => {
      setFloatingDamages((prev) => prev.filter((d) => d.id !== dmg.id));
    }, 1200);
  }, []);

  const handleMonsterCaught = useCallback((newMonster: ActiveMonster) => {
    setParty((prev) => (prev.length < 6 ? [...prev, newMonster] : prev));
    setCaughtSpecies((prev) => (prev.includes(newMonster.speciesId) ? prev : [...prev, newMonster.speciesId]));
  }, []);

  const handleCaptureStatus = useCallback((status: string | null) => {
    setCaptureStatus(status);
  }, []);

  const handleLevelUp = useCallback((updatedPartner: ActiveMonster) => {
    setParty((prev) =>
      prev.map((m) => (m.instanceId === updatedPartner.instanceId ? { ...updatedPartner } : m))
    );
  }, []);

  const handleEvolutionReady = useCallback((mon: ActiveMonster, targetSpeciesId: string) => {
    setPendingEvolution({
      partner: mon,
      targetSpeciesId,
    });
  }, []);

  const handleBattleLog = useCallback((msg: string) => {
    setBattleLogs((prev) => [...prev.slice(-15), msg]);
  }, []);

  // Initialize GameEngine once
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const engine = new GameEngine(
      canvasMountRef.current,
      activePartner,
      inventory,
      {
        onMinimapUpdate: handleMinimapUpdate,
        onTargetChanged: handleTargetChanged,
        onDamageNumber: handleDamageNumber,
        onMonsterCaught: handleMonsterCaught,
        onCaptureStatus: handleCaptureStatus,
        onLevelUp: handleLevelUp,
        onEvolutionReady: handleEvolutionReady,
        onBattleLog: handleBattleLog,
      }
    );

    engineRef.current = engine;

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // Sync inventory changes to engine
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setInventory(inventory);
    }
  }, [inventory]);

  // Handle partner selection
  const handleSelectPartner = (index: number) => {
    setActivePartnerIndex(index);
    const chosen = party[index];
    if (chosen && engineRef.current) {
      engineRef.current.setActivePartner(chosen);
    }
    setIsPartyOpen(false);
  };

  // Evolution complete handler
  const handleCompleteEvolution = (evolvedSpeciesId: string) => {
    const targetSpecies = MONSTERS_DATABASE[evolvedSpeciesId];
    if (!targetSpecies || !pendingEvolution) return;

    const updated = {
      ...pendingEvolution.partner,
      speciesId: evolvedSpeciesId,
      nickname: targetSpecies.name,
      moves: [...targetSpecies.moves],
      stats: {
        hp: Math.floor(targetSpecies.baseStats.hp * (1 + pendingEvolution.partner.level * 0.12)),
        attack: Math.floor(targetSpecies.baseStats.attack * (1 + pendingEvolution.partner.level * 0.12)),
        defense: Math.floor(targetSpecies.baseStats.defense * (1 + pendingEvolution.partner.level * 0.12)),
        spAttack: Math.floor(targetSpecies.baseStats.spAttack * (1 + pendingEvolution.partner.level * 0.12)),
        spDefense: Math.floor(targetSpecies.baseStats.spDefense * (1 + pendingEvolution.partner.level * 0.12)),
        speed: Math.floor(targetSpecies.baseStats.speed * (1 + pendingEvolution.partner.level * 0.12)),
      },
    };

    setParty((prev) =>
      prev.map((m) => (m.instanceId === updated.instanceId ? updated : m))
    );

    if (engineRef.current && pendingEvolution.partner.instanceId === activePartner.instanceId) {
      engineRef.current.setActivePartner(updated);
    }

    setCaughtSpecies((prev) => (prev.includes(evolvedSpeciesId) ? prev : [...prev, evolvedSpeciesId]));
    setPendingEvolution(null);
    handleBattleLog(`Parabéns! ${targetSpecies.name} agora faz parte da sua jornada!`);
  };

  // Item usage handlers
  const handleUsePotion = (item: InventoryItem) => {
    if (item.quantity <= 0) return;
    const heal = item.healAmount || 50;
    const newHp = Math.min(activePartner.maxHp, activePartner.currentHp + heal);
    activePartner.currentHp = newHp;

    setInventory((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i))
    );
    setParty((prev) =>
      prev.map((m) => (m.instanceId === activePartner.instanceId ? { ...activePartner, currentHp: newHp } : m))
    );

    soundManager.playCatchSuccess();
    handleBattleLog(`Curou ${activePartner.nickname} com ${item.name} (+${heal} HP)!`);
  };

  const handleUseBerry = (item: InventoryItem) => {
    if (item.quantity <= 0) return;
    const newFriendship = Math.min(100, activePartner.friendship + 15);
    activePartner.friendship = newFriendship;
    const newHp = Math.min(activePartner.maxHp, activePartner.currentHp + 30);
    activePartner.currentHp = newHp;

    setInventory((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i))
    );
    setParty((prev) =>
      prev.map((m) =>
        m.instanceId === activePartner.instanceId
          ? { ...activePartner, friendship: newFriendship, currentHp: newHp }
          : m
      )
    );

    soundManager.playCatchSuccess();
    handleBattleLog(`${activePartner.nickname} adorou a fruta! Amizade subiu para ${newFriendship}%!`);

    // Check if friendship triggers evolution!
    if (engineRef.current) {
      engineRef.current.checkEvolutionConditions();
    }
  };

  const handleUseStone = (item: InventoryItem, targetSpeciesId: string) => {
    if (item.quantity <= 0) return;
    setInventory((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i))
    );
    setIsBagOpen(false);

    // Launch dramatic evolution sequence!
    setPendingEvolution({
      partner: activePartner,
      targetSpeciesId,
    });
  };

  // Battle actions
  const handleUseMove = (idx: number) => {
    if (engineRef.current) engineRef.current.useMove(idx);
  };

  const handleDodge = () => {
    if (engineRef.current) engineRef.current.playerDodge();
  };

  const handleThrowBall = () => {
    if (engineRef.current) engineRef.current.throwCaptureBall(selectedBall);
  };

  const handleCycleTarget = () => {
    if (engineRef.current) engineRef.current.cycleTarget();
  };

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  return (
    <Nintendo3DSFrame
      is3DSMode={is3DSMode}
      onToggle3DSMode={() => setIs3DSMode((prev) => !prev)}
      onOpenDex={() => setIsDexOpen(true)}
      onOpenBag={() => setIsBagOpen(true)}
      onOpenParty={() => setIsPartyOpen(true)}
      isMuted={isMuted}
      onToggleMute={handleToggleMute}
    >
      {/* 3D WebGL Canvas Container */}
      <div className="relative w-full h-full overflow-hidden bg-slate-950">
        <div ref={canvasMountRef} className="absolute inset-0 w-full h-full z-0 cursor-grab active:cursor-grabbing" />

        {/* Floating Damage Text Indicators */}
        <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
          {floatingDamages.map((dmg) => (
            <div
              key={dmg.id}
              className="absolute font-black text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] animate-out fade-out slide-out-to-top duration-1000"
              style={{
                left: `${dmg.x}px`,
                top: `${dmg.y}px`,
                color: dmg.color,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {dmg.text}
            </div>
          ))}
        </div>

        {/* Real-Time Battle HUD */}
        <BattleHUD
          partner={activePartner}
          target={currentTarget}
          inventory={inventory}
          selectedBall={selectedBall}
          onSelectBall={setSelectedBall}
          onUseMove={handleUseMove}
          onDodge={handleDodge}
          onThrowBall={handleThrowBall}
          onCycleTarget={handleCycleTarget}
          captureStatus={captureStatus}
          battleLogs={battleLogs}
        />

        {/* Minimap (Positioned at bottom-right directly mirroring the attached screenshot!) */}
        <div className="absolute bottom-5 right-5 z-20 pointer-events-auto">
          <Minimap
            playerX={minimapData.playerX}
            playerZ={minimapData.playerZ}
            playerRot={minimapData.playerRot}
            monsters={minimapData.monsters}
          />
        </div>

        {/* Controls Guide Button (Top-Left) */}
        <div className="absolute top-4 left-4 z-30">
          <button
            onClick={() => setIsControlsOpen((prev) => !prev)}
            className="p-2.5 rounded-2xl bg-slate-900/85 hover:bg-slate-800 border border-slate-700/80 text-slate-300 shadow-xl backdrop-blur-md flex items-center gap-1.5 text-xs font-bold active:scale-95 transition-all"
            title="Guia de Comandos"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Controles</span>
          </button>
        </div>

        {/* Collapsible Controls Guide Overlay */}
        {isControlsOpen && (
          <div className="absolute top-16 left-4 z-30 w-80 bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-2xl backdrop-blur-md text-xs space-y-2 animate-in fade-in slide-in-from-top-2">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="font-extrabold text-amber-400">Guia de Exploração e Batalha</span>
              <button
                onClick={() => setIsControlsOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Mover Treinador:</span>
                <span className="font-mono text-amber-300 font-bold">W, A, S, D / Setas</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Girar Câmera:</span>
                <span className="font-mono text-amber-300 font-bold">Arrastar Mouse / Touch</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Esquivar / Bote:</span>
                <span className="font-mono text-amber-300 font-bold">Espaço (Space)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Trocar / Fixar Alvo:</span>
                <span className="font-mono text-amber-300 font-bold">Q ou TAB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Desferir Golpes:</span>
                <span className="font-mono text-amber-300 font-bold">Teclas 1, 2, 3, 4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Lançar Esfera:</span>
                <span className="font-mono text-amber-300 font-bold">Tecla E / Botão Arremesso</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Correr Rápido:</span>
                <span className="font-mono text-amber-300 font-bold">Segurar SHIFT</span>
              </div>
            </div>
          </div>
        )}

        {/* Pokédex Modal */}
        {isDexOpen && (
          <PokedexModal
            onClose={() => setIsDexOpen(false)}
            caughtSpecies={caughtSpecies}
          />
        )}

        {/* Party Modal */}
        {isPartyOpen && (
          <PartyModal
            party={party}
            activePartnerIndex={activePartnerIndex}
            onSelectPartner={handleSelectPartner}
            onClose={() => setIsPartyOpen(false)}
          />
        )}

        {/* Bag Modal */}
        {isBagOpen && (
          <BagModal
            inventory={inventory}
            partner={activePartner}
            onUsePotion={handleUsePotion}
            onUseBerry={handleUseBerry}
            onUseStone={handleUseStone}
            onClose={() => setIsBagOpen(false)}
          />
        )}

        {/* Dramatic 3DS Evolution Cinematic Modal */}
        {pendingEvolution && (
          <EvolutionModal
            partner={pendingEvolution.partner}
            targetSpeciesId={pendingEvolution.targetSpeciesId}
            onComplete={handleCompleteEvolution}
            onCancel={() => setPendingEvolution(null)}
          />
        )}
      </div>
    </Nintendo3DSFrame>
  );
}
