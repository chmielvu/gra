
import React from 'react';
import { YandereLedger, GeneratedCharacter } from 'src/types/index';

interface LedgerDisplayProps {
  ledger: YandereLedger;
  player: GeneratedCharacter;
  rosters: {
      educators: GeneratedCharacter[];
      subjects: GeneratedCharacter[];
  }
}

const StatBar: React.FC<{ label: string; value: number; max?: number; colorClass: string; tooltip: string }> = ({ label, value, max = 100, colorClass, tooltip }) => {
    const percentage = (value / max) * 100;
    return (
        <div className="group relative" title={tooltip}>
            <div className="flex justify-between items-baseline mb-1">
                <dt className="text-slate-400 text-sm">{label}</dt>
                <dd className="font-bold text-slate-200 font-mono">{value}</dd>
            </div>
            <div className="w-full bg-slate-900/50 rounded-full h-2.5">
                <div className={`${colorClass} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

const LedgerDisplay: React.FC<LedgerDisplayProps> = ({ ledger, player, rosters }) => {
  const allCharacters = [...rosters.educators, ...rosters.subjects, player];
  const findCharacterName = (id: string) => allCharacters.find(c => c.id === id)?.name || id;

  return (
    <div className="bg-slate-800/60 p-4 rounded-lg shadow-lg border border-slate-700 sticky top-28 animate-fade-in">
      <h3 className="text-xl font-bold font-serif text-red-400 mb-4 border-b border-slate-700 pb-2">Player Status</h3>
      <div className="mb-4">
        <p className="text-lg text-slate-100 font-bold">{player.name}</p>
        <p className="text-sm text-slate-400 italic">"{player.archetype}"</p>
        {player.currentMood && (
          <p className="text-sm text-slate-300 font-sans mt-2">Mood: <span className="font-semibold text-amber-300 bg-amber-900/50 px-2 py-1 rounded">{player.currentMood}</span></p>
        )}
        <p className="text-xs text-slate-400 mt-2">Traits: {player.traits.join(', ')}</p>
      </div>

      <dl className="space-y-4 font-sans">
        <StatBar label="Hope" value={ledger.hopeLevel} colorClass="bg-sky-500" tooltip="How much resilience and will to endure remains."/>
        <StatBar label="Trauma" value={ledger.traumaLevel} colorClass="bg-purple-500" tooltip="The accumulation of psychological damage."/>
        <StatBar label="Physical Integrity" value={ledger.physicalIntegrity} colorClass="bg-green-500" tooltip="Current physical wellbeing and health."/>
        <StatBar label="Agency" value={ledger.subjectAgencyBudget} colorClass="bg-amber-500" tooltip="The capacity to act freely and defy control."/>
        <StatBar label="Shame/Pain Abyss" value={ledger.shamePainAbyssLevel} colorClass="bg-rose-700" tooltip="The depth of psychological pain and humiliation."/>
        
        {Object.keys(ledger.interpersonalBonds).length > 0 && (
            <div>
                <dt className="text-slate-400 text-sm mb-2 font-bold">Interpersonal Bonds:</dt>
                <dd className="text-slate-200 text-sm space-y-2">
                    {Object.entries(ledger.interpersonalBonds).map(([charId, bondValue]: [string, number]) => (
                        <div key={charId} className="flex justify-between items-center bg-slate-900/50 p-2 rounded">
                            <span>{findCharacterName(charId)}:</span>
                            <span className={`font-bold font-mono ${bondValue > 0 ? 'text-cyan-400' : 'text-orange-400'}`}>{bondValue}</span>
                        </div>
                    ))}
                </dd>
            </div>
        )}
      </dl>
    </div>
  );
};

export default LedgerDisplay;