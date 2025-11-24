import { Timer } from 'lucide-react';

interface QuestionTimerProps {
  timeRemaining: number;
  isLocked: boolean;
}

export function QuestionTimer({ timeRemaining, isLocked }: QuestionTimerProps) {
  const isWarning = timeRemaining <= 10 && timeRemaining > 0;
  const isExpired = timeRemaining === 0;
  
  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
      isExpired 
        ? 'bg-red-100 text-red-700 border-2 border-red-500' 
        : isWarning 
        ? 'bg-orange-100 text-orange-700 border-2 border-orange-400 animate-pulse' 
        : 'bg-blue-50 text-blue-700 border-2 border-blue-300'
    }`}>
      <Timer className={`w-5 h-5 ${isExpired || isWarning ? 'animate-bounce' : ''}`} />
      <div className="flex flex-col">
        <span className="text-2xl tabular-nums">
          {String(Math.floor(timeRemaining / 60)).padStart(2, '0')}:
          {String(timeRemaining % 60).padStart(2, '0')}
        </span>
        {isExpired && (
          <span className="text-xs font-normal">Temps écoulé</span>
        )}
        {isWarning && !isExpired && (
          <span className="text-xs font-normal">Attention!</span>
        )}
      </div>
    </div>
  );
}

