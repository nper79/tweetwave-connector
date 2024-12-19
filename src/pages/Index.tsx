import { LeaderboardHeader } from "@/components/leaderboard/LeaderboardHeader";
import { LeaderboardTabs } from "@/components/leaderboard/LeaderboardTabs";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { TopPerformers } from "@/components/leaderboard/TopPerformers";
import { LatestPredictions } from "@/components/leaderboard/LatestPredictions";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <LeaderboardHeader />
            <LeaderboardTabs />
            <LeaderboardTable />
          </div>
          <div>
            <TopPerformers />
            <LatestPredictions />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;