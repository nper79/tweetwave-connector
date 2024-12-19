import { Button } from "@/components/ui/button";

export const LeaderboardTabs = () => {
  return (
    <div className="flex gap-2 mb-6">
      <Button variant="default" className="bg-blue-600 hover:bg-blue-700">All Time</Button>
      <Button variant="ghost">Monthly</Button>
      <Button variant="ghost">Weekly</Button>
      <Button variant="ghost">Daily</Button>
    </div>
  );
};