import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";
import { useTwitterTimeline } from "@/hooks/use-twitter";
import { Skeleton } from "@/components/ui/skeleton";
import { usePredictionFiltering } from "@/hooks/use-prediction-filtering";
import { PredictionList } from "@/components/predictions/PredictionList";

export const LatestPredictions = () => {
  const { data: tweets, isLoading, error } = useTwitterTimeline("SolbergInvest");
  const predictionsFromTweets = usePredictionFiltering(tweets);

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-500" />
            Latest Predictions
          </CardTitle>
          <span className="text-sm text-gray-500 dark:text-gray-400">Live Updates</span>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-3 rounded-md bg-gray-50 dark:bg-gray-900">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white dark:bg-gray-800 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-500" />
            Latest Predictions
          </CardTitle>
          <span className="text-sm text-gray-500 dark:text-gray-400">Live Updates</span>
        </CardHeader>
        <CardContent>
          <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
            Failed to load predictions: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Target className="h-5 w-5 text-indigo-500" />
          Latest Predictions
        </CardTitle>
        <span className="text-sm text-gray-500 dark:text-gray-400">Live Updates</span>
      </CardHeader>
      <CardContent>
        <PredictionList predictions={predictionsFromTweets} />
      </CardContent>
    </Card>
  );
};