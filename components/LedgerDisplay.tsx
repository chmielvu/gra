import React from 'react';
import type { YandereLedger } from '../types';

interface LedgerDisplayProps {
  ledger: YandereLedger;
}

const LedgerItem: React.FC<{ label: string; value: string | number; accent?: boolean }> = ({ label, value, accent = false }) => (
    <div className="flex justify-between items-baseline">
        <dt className="text-slate-400 text-sm">{label}:</dt>
        <dd className={`font-bold text-right truncate ${accent ? 'text-red-400' : 'text-slate-200'}`}>
            {value}
        </dd>
    </div>
);


const LedgerDisplay: React.FC<LedgerDisplayProps> = ({ ledger }) => {
  return (
    <div className="bg-slate-800/60 p-6 rounded-2xl shadow-lg border border-slate-700 sticky top-28">
      <h3 className="text-xl font-bold font-serif text-sky-400 mb-4 border-b border-slate-700 pb-2">Yandere Ledger</h3>
      <dl className="space-y-3 font-sans">
        <LedgerItem label="Psychological State" value={ledger.currentNodeId} />
        <LedgerItem label="Subject Agency Budget" value={ledger.subjectAgencyBudget} accent />
        <LedgerItem label="Shame/Pain Abyss" value={ledger.shamePainAbyssLevel} accent />
        
        <div>
            <dt className="text-slate-400 text-sm mb-1">Active Archetypes:</dt>
            <dd className="text-slate-200 text-xs space-y-1">
                {ledger.activeArchetypeRoster?.map(char => (
                    <div key={char.character} className="bg-slate-900/50 p-2 rounded">
                        <span className="font-bold">{char.character}:</span> 
                        <span className="italic text-slate-300 ml-1">"{char.archetype}"</span>
                    </div>
                ))}
            </dd>
        </div>

        {ledger.emergentCharacterPool && ledger.emergentCharacterPool.length > 0 && (
             <div>
                <dt className="text-slate-400 text-sm mb-1">Emergent Pool:</dt>
                <dd className="text-slate-400 text-xs">
                    {ledger.emergentCharacterPool?.map(char => char.character).join(', ')}
                </dd>
            </div>
        )}
      </dl>
    </div>
  );
};

export default LedgerDisplay;