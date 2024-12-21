import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const PredictionTableHeader = () => {
  return (
    <TableHeader>
      <TableRow className="border-b dark:border-gray-800">
        <TableHead className="text-gray-500 dark:text-gray-400">CRYPTO</TableHead>
        <TableHead className="text-gray-500 dark:text-gray-400">PRICE AT PREDICTION</TableHead>
        <TableHead className="text-gray-500 dark:text-gray-400">CURRENT PRICE</TableHead>
        <TableHead className="text-gray-500 dark:text-gray-400">24H ROI</TableHead>
        <TableHead className="text-gray-500 dark:text-gray-400">3D ROI</TableHead>
        <TableHead className="text-gray-500 dark:text-gray-400">1W ROI</TableHead>
        <TableHead className="text-gray-500 dark:text-gray-400">1M ROI</TableHead>
      </TableRow>
    </TableHeader>
  );
};