import { Table, TableBody } from "@/components/ui/table";
import { useTwitterTimeline } from "@/hooks/use-twitter";
import { Skeleton } from "@/components/ui/skeleton";
import { PredictionRow } from "./PredictionRow";
import { PredictionTableHeader } from "./PredictionTableHeader";
import { usePredictionData } from "@/hooks/use-prediction-data";

interface PredictionsTableProps {
  username?: string;
}

export const PredictionsTable = ({ username = "SolbergInvest" }: PredictionsTableProps) => {
  const { data: tweets, isLoading: tweetsLoading } = useTwitterTimeline(username);
  const { predictions, isLoading: predictionsLoading } = usePredictionData(tweets || [], username);

  if (tweetsLoading || predictionsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full dark:bg-gray-700" />
        <Skeleton className="h-8 w-full dark:bg-gray-700" />
        <Skeleton className="h-8 w-full dark:bg-gray-700" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg bg-white dark:bg-gray-900 shadow-sm">
      <Table>
        <PredictionTableHeader />
        <TableBody>
          {predictions.map((prediction) => (
            <PredictionRow 
              key={`${prediction.crypto}-${prediction.predictionDate}`}
              prediction={prediction}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};