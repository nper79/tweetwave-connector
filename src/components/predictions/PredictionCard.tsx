import { Tweet } from "@/types/twitter";
import { Clock, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PredictionCardProps {
  tweet: Tweet;
}

export const PredictionCard = ({ tweet }: PredictionCardProps) => {
  return (
    <div className="p-3 rounded-md bg-gray-50 dark:bg-gray-900">
      <p className="text-sm text-gray-900 dark:text-gray-100 mb-2">{tweet.text}</p>
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Clock className="h-3 w-3" />
        {formatDistanceToNow(new Date(tweet.created_at), { addSuffix: true })}
        <a
          href={`https://twitter.com/SolbergInvest/status/${tweet.tweet_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-indigo-500 transition-colors ml-auto"
        >
          View <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
};