import { Search, Trophy, Bot } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const LeaderboardHeader = () => {
  const { toast } = useToast();

  const testGrokApi = async () => {
    try {
      toast({
        title: "Testing Grok API...",
        description: "Making a test call to the API",
      });

      const { data, error } = await supabase.functions.invoke('test-grok', {
        body: { message: "Hello from TweetWave!" }
      });

      if (error) {
        console.error("Grok API test error:", error);
        
        // Special handling for rate limiting
        if (error.status === 429) {
          toast({
            title: "Rate Limit Exceeded",
            description: "Too many requests. Please try again later.",
            variant: "destructive",
          });
          return;
        }
        
        toast({
          title: "Grok API Test Failed",
          description: error.message || "Unknown error occurred",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Grok API Test Successful",
        description: "Check the Edge Function logs for details",
        variant: "default",
      });
      
      console.log("Grok API test response:", data);
    } catch (error) {
      console.error("Grok API test error:", error);
      toast({
        title: "Error",
        description: "Failed to test Grok API. Check console for details.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
      <div className="flex items-center gap-3">
        <Trophy className="h-8 w-8 text-yellow-500" />
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Crypto Predictions Leaderboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track the most successful crypto predictors
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={testGrokApi}
        >
          <Bot className="h-4 w-4" />
          Test Grok
        </Button>
        <div className="relative w-full md:w-64">
          <Input
            type="text"
            placeholder="Search traders..."
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>
    </div>
  );
};