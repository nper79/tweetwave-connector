import { Button } from "@/components/ui/button";
import { Calendar, Clock, Sun, Calendar as CalendarIcon } from "lucide-react";

export const LeaderboardTabs = () => {
  return (
    <div className="flex flex-wrap gap-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
      <Button variant="default" className="bg-blue-600 hover:bg-blue-700 gap-2">
        <CalendarIcon className="h-4 w-4" />
        All Time
      </Button>
      <Button variant="ghost" className="gap-2">
        <Calendar className="h-4 w-4" />
        Monthly
      </Button>
      <Button variant="ghost" className="gap-2">
        <Clock className="h-4 w-4" />
        Weekly
      </Button>
      <Button variant="ghost" className="gap-2">
        <Sun className="h-4 w-4" />
        Daily
      </Button>
    </div>
  );
};