import React from 'react';
import { GameState, CreativeOutput } from '../../../shared/types/index';
// FIX: Switched to relative paths for component imports to resolve module loading errors.
import ImageDisplay from '../../../components/ImageDisplay';
import StoryDisplay from '../../../components/StoryDisplay';
import ChoicePanel from '../../../components/ChoicePanel';
import LedgerDisplay from '../../../components/LedgerDisplay';
import Loader from '../../../components/Loader';
import ErrorMessage from '../../../components/ErrorMessage';

interface GameLayoutProps {
    isLoading: boolean;
    error: string | null;
    gameState: GameState;
    currentTurn: CreativeOutput;
    assets: { imageData: string, audioData: string };
    onChoice: (choiceId: string) => void;
}

const GameLayout: React.FC<GameLayoutProps> = ({
    isLoading,
    error,
    gameState,
    currentTurn,
    assets,
    onChoice,
}) => {
    return (
        <div className="relative flex-grow flex flex-col justify-end min-h-[80vh]">
            <ImageDisplay imageUrl={assets.imageData} />

            <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 items-end">
                {/* Main content area */}
                <div className="md:col-span-2 lg:col-span-3">
                    {isLoading && <Loader message="The Alchemist is weaving the next thread..." />}
                    {error && <ErrorMessage message={error} />}
                    <StoryDisplay narrative={currentTurn.narrative} />
                    <ChoicePanel 
                        choices={currentTurn.playerChoices} 
                        onChoice={onChoice} 
                        disabled={isLoading}
                    />
                </div>

                {/* Ledger on the side */}
                <div className="md:col-span-1 lg:col-span-1">
                    <LedgerDisplay 
                        ledger={gameState.currentLedger}
                        player={gameState.playerCharacter}
                        rosters={{ educators: gameState.educatorRoster, subjects: gameState.subjectRoster }}
                    />
                </div>
            </div>
        </div>
    );
};

export default GameLayout;