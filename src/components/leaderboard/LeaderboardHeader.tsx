import { Search, Trophy } from "lucide-react";
import { Input } from "@/components/ui/input";

export const LeaderboardHeader = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
      <div className="flex items-center gap-3">
        <Trophy className="h-8 w-8 text-yellow-500" />
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Crypto Predictions Leaderboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track the most successful crypto predictors
          </p>
        </div>
      </div>
      <div className="relative w-full md:w-64">
        <Input
          type="text"
          placeholder="Search traders..."
          className="pl-10"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>
    </div>
  );
};