import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import useSound from 'use-sound';

// ------------------------------------------------------------------
// 🎵 CONFIGURAÇÃO DE ÁUDIO
// Coloque seus arquivos em: public/sounds/
// Exemplo: public/sounds/buy.mp3
// ------------------------------------------------------------------
const SOUND_PATHS = {
  buy: '/sounds/buy.mp3',
  click: '/sounds/click.mp3',
  money: '/sounds/money.mp3',
  bgm: '/sounds/bgm.mp3',
};

interface SoundContextType {
  isMuted: boolean;
  volume: number;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  playBuy: () => void;
  playClick: () => void;
  playMoney: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persist Mute Preference
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('vibe_capitalist_muted');
    return saved ? JSON.parse(saved) : false;
  });

  // Persist Volume Preference
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('vibe_capitalist_volume');
    return saved ? parseFloat(saved) : 0.5;
  });

  useEffect(() => {
    localStorage.setItem('vibe_capitalist_muted', JSON.stringify(isMuted));
  }, [isMuted]);

  useEffect(() => {
    localStorage.setItem('vibe_capitalist_volume', volume.toString());
  }, [volume]);

  // ------------------------------------------------------------------
  // 🔊 SFX HOOKS
  // Carregamos os sons aqui uma única vez para o app inteiro
  // IMPORTANTE: Volume é aplicado dinamicamente
  // ------------------------------------------------------------------
  
  const [playBuySfx] = useSound(SOUND_PATHS.buy, { 
    volume: volume * 0.5, 
    soundEnabled: !isMuted 
  });
  
  const [playClickSfx] = useSound(SOUND_PATHS.click, { 
    volume: volume * 0.3, 
    soundEnabled: !isMuted 
  });
  
  const [playMoneySfx] = useSound(SOUND_PATHS.money, { 
    volume: volume * 0.4, 
    soundEnabled: !isMuted,
    interrupt: true // Permite spammar o som de dinheiro
  });

  // ------------------------------------------------------------------
  // 🎶 BGM HOOK (Música de Fundo) - OPCIONAL
  // ------------------------------------------------------------------
  // Comentado temporariamente até que bgm.mp3 seja adicionado
  // const [playBgm, { stop: stopBgm, sound }] = useSound(SOUND_PATHS.bgm, {
  //   volume: volume * 0.15,
  //   loop: true,
  //   soundEnabled: !isMuted
  // });

  // // Atualiza o volume do BGM quando o volume geral mudar
  // useEffect(() => {
  //   if (sound) {
  //     sound.volume(volume * 0.15);
  //   }
  // }, [volume, sound]);

  // // Effect to handle BGM state changes
  // useEffect(() => {
  //   if (!isMuted && hasInteracted) {
  //     playBgm();
  //   } else {
  //     stopBgm();
  //   }
  //   return () => stopBgm();
  // }, [isMuted, hasInteracted, playBgm, stopBgm]);

  // // Detecta primeira interação do usuário
  // useEffect(() => {
  //   const handleFirstInteraction = () => {
  //     if (!hasInteracted) {
  //       setHasInteracted(true);
  //     }
  //   };
  //   window.addEventListener('click', handleFirstInteraction, { once: true });
  //   window.addEventListener('keydown', handleFirstInteraction, { once: true });
  //   return () => {
  //     window.removeEventListener('click', handleFirstInteraction);
  //     window.removeEventListener('keydown', handleFirstInteraction);
  //   };
  // }, [hasInteracted]);

  // Wrapper functions for safety
  const playBuy = useCallback(() => playBuySfx(), [playBuySfx]);
  const playClick = useCallback(() => playClickSfx(), [playClickSfx]);
  const playMoney = useCallback(() => playMoneySfx(), [playMoneySfx]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev: boolean) => !prev);
  }, []);

  return (
    <SoundContext.Provider value={{ isMuted, volume, toggleMute, setVolume, playBuy, playClick, playMoney }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useGameSounds = () => {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useGameSounds must be used within a SoundProvider');
  }
  return context;
};