import { LeaderboardHeader } from "@/components/leaderboard/LeaderboardHeader";
import { LeaderboardTabs } from "@/components/leaderboard/LeaderboardTabs";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { TopPerformers } from "@/components/leaderboard/TopPerformers";
import { BestPredictions } from "@/components/leaderboard/BestPredictions";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">TweetWave Connector</h1>
          <ThemeToggle />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <LeaderboardHeader />
            <LeaderboardTabs />
            <LeaderboardTable />
          </div>
          <div className="space-y-6">
            <TopPerformers />
            <BestPredictions />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;