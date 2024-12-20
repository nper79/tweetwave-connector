import { Tweet } from "@/types/twitter";
import { CalendarDays, MessageCircle, Heart, Repeat2, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface TweetCardProps {
  tweet: Tweet;
  isPrediction: boolean;
}

export const TweetCard = ({ tweet, isPrediction }: TweetCardProps) => {
  if (!tweet || !tweet.author) return null;

  const hasMedia = tweet.media?.photo && tweet.media.photo[0];

  return (
    <div
      className={`p-4 border rounded-lg hover:border-blue-400 transition-colors bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm ${
        isPrediction ? 'border-green-400 bg-green-50 dark:bg-green-900/20' : ''
      }`}
    >
      <div className="flex items-start space-x-3 mb-2">
        {tweet.author.avatar && (
          <img
            src={tweet.author.avatar}
            alt={tweet.author.name || "Author"}
            className="w-10 h-10 rounded-full"
          />
        )}
        <div className="flex-1">
          <p className="font-semibold dark:text-gray-100">{tweet.author.name || "Unknown Author"}</p>
          <p className="text-gray-500 dark:text-gray-400">@{tweet.author.screen_name}</p>
        </div>
        {isPrediction && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium">
            <span>Prediction</span>
          </div>
        )}
      </div>
      
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{tweet.text}</p>
        </div>
        
        {hasMedia && (
          <Dialog>
            <DialogTrigger asChild>
              <div className="flex-shrink-0 w-64 cursor-pointer">
                <img
                  src={tweet.media.photo[0].media_url_https}
                  alt="Tweet media"
                  className="rounded-lg object-cover w-full h-full max-h-48"
                />
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <img
                src={tweet.media.photo[0].media_url_https}
                alt="Tweet media"
                className="w-full h-auto rounded-lg"
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 border-t dark:border-gray-700 pt-4">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-4 w-4" />
          <span>{tweet.replies || 0}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Repeat2 className="h-4 w-4" />
          <span>{tweet.retweets || 0}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Heart className="h-4 w-4" />
          <span>{tweet.favorites || 0}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Eye className="h-4 w-4" />
          <span>{tweet.views || 0}</span>
        </div>
        <div className="flex items-center">
          <CalendarDays className="mr-2 h-4 w-4" />
          <time dateTime={tweet.created_at}>
            {new Date(tweet.created_at).toLocaleDateString()}
          </time>
        </div>
      </div>
    </div>
  );
};