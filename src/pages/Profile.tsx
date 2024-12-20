import { useParams } from "react-router-dom";
import { TwitterTimeline } from "@/components/twitter/TwitterTimeline";
import { Card } from "@/components/ui/card";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PredictionsTable } from "@/components/predictions/PredictionsTable";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const Profile = () => {
  const { username } = useParams();

  if (!username) {
    return <div>Username not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <ProfileHeader username={username} />
          <ThemeToggle />
        </div>

        <Card className="p-6 bg-white dark:bg-gray-800">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Predictions</h2>
          <PredictionsTable />
        </Card>

        <Card className="p-6 bg-white dark:bg-gray-800">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Latest Predictions</h2>
          <TwitterTimeline username={username} />
        </Card>
      </div>
    </div>
  );
};

export default Profile;