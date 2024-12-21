import { Award, Medal } from "lucide-react";

interface TraderBadgeProps {
  rank: number;
  badge: string;
  streak: number;
}

export const TraderBadge = ({ rank, badge, streak }: TraderBadgeProps) => {
  return (
    <div className="flex items-center gap-2">
      <div>
        <div className="font-semibold flex items-center gap-2">
          {rank === 1 && <Award className="h-5 w-5 text-yellow-500" />}
          {rank === 2 && <Medal className="h-5 w-5 text-gray-400" />}
          {rank === 3 && <Medal className="h-5 w-5 text-amber-600" />}
          {rank}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{streak} streak</div>
      </div>
      <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full">
        {badge}
      </span>
    </div>
  );
};