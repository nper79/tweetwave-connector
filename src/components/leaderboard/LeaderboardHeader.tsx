import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const LeaderboardHeader = () => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-2">
        <div className="text-2xl font-bold">🏆 Leaderboard</div>
      </div>
      <div className="relative w-64">
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