import { TwitterTimeline } from "@/components/twitter/TwitterTimeline";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Twitter Timeline
        </h1>
        <TwitterTimeline />
      </div>
    </div>
  );
};

export default Index;