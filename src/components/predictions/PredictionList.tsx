import { PredictionCard } from "./PredictionCard";
import { Tweet } from "@/types/twitter";

interface PredictionListProps {
  predictions: Tweet[];
}

export const PredictionList = ({ predictions }: PredictionListProps) => {
  return (
    <div className="space-y-4">
      {predictions.map((tweet) => (
        <PredictionCard key={tweet.tweet_id} tweet={tweet} />
      ))}
      {predictions.length === 0 && (
        <div className="text-center p-4 text-gray-500 dark:text-gray-400">
          No predictions found
        </div>
      )}
    </div>
  );
};