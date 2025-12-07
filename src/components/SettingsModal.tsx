import React from 'react';
import { useGameSounds } from '../hooks/useGameSounds';
import { X, Volume2, VolumeX, Settings, Trash2, Save } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onReset }) => {
  const { isMuted, volume, toggleMute, setVolume } = useGameSounds();
  
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-2 text-white font-bold">
            <Settings size={20} className="text-zinc-400" />
            <span>Settings</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          
          {/* Audio Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Audio</h3>
            
            {/* Mute Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-300">Master Sound</span>
              <button
                onClick={toggleMute}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border
                  ${isMuted 
                    ? 'bg-red-900/20 text-red-400 border-red-900/50' 
                    : 'bg-emerald-900/20 text-emerald-400 border-emerald-900/50'}`}
              >
                {isMuted ? (
                  <> <VolumeX size={14} /> MUTED </>
                ) : (
                  <> <Volume2 size={14} /> ON </>
                )}
              </button>
            </div>

            {/* Volume Slider */}
            <div className={`space-y-2 transition-opacity duration-200 ${isMuted ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Volume</span>
                <span className="font-bold text-emerald-400">{Math.round(volume * 100)}%</span>
              </div>
              <div className="relative">
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400"
                  style={{
                    background: `linear-gradient(to right, rgb(16 185 129) 0%, rgb(16 185 129) ${volume * 100}%, rgb(39 39 42) ${volume * 100}%, rgb(39 39 42) 100%)`
                  }}
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-zinc-800 w-full" />

          {/* Data Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Data Management</h3>
            
            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-xs text-zinc-500 flex items-start gap-2">
              <Save size={14} className="mt-0.5 shrink-0" />
              <p>Game is auto-saved locally to your browser every 2 seconds.</p>
            </div>

            <button
              onClick={() => {
                if(window.confirm('WARNING: This will completely WIPE your save file. This is a Hard Reset (not Prestige). Continue?')) {
                  onReset();
                }
              }}
              className="w-full py-3 flex items-center justify-center gap-2 bg-red-900/10 hover:bg-red-900/20 text-red-500 hover:text-red-400 border border-red-900/30 rounded-lg transition-all font-bold text-sm"
            >
              <Trash2 size={16} />
              Hard Reset Save
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 text-center">
          <p className="text-[10px] text-zinc-600">Vibe Capitalist v1.0.0 • Made with 🔥</p>
        </div>

      </div>
    </div>
  );
};