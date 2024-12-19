import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";

interface ProfileHeaderProps {
  username: string;
}

export const ProfileHeader = ({ username }: ProfileHeaderProps) => {
  return (
    <>
      <div className="flex justify-between items-center">
        <Link
          to="/"
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Leaderboard
        </Link>
        <a
          href={`https://x.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-2"
        >
          View on X <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        {username}'s Profile
      </h1>
    </>
  );
};