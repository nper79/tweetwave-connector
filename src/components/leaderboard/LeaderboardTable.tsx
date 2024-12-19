import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, Award, Medal } from "lucide-react";

interface Trader {
  rank: number;
  name: string;
  badge: string;
  streak: number;
  predictions: number;
  successRate: number;
  roi: number;
  change24h: number;
}

const traders: Trader[] = [
  {
    rank: 1,
    name: "SolbergInvest",
    badge: "Elite",
    streak: 12,
    predictions: 156,
    successRate: 94.2,
    roi: 324.5,
    change24h: 2.3,
  },
  {
    rank: 2,
    name: "CryptoWhale",
    badge: "Pro",
    streak: 8,
    predictions: 142,
    successRate: 91.8,
    roi: 286.3,
    change24h: 1.8,
  },
  {
    rank: 3,
    name: "BlockchainGuru",
    badge: "Pro",
    streak: 6,
    predictions: 128,
    successRate: 89.5,
    roi: 245.7,
    change24h: -0.5,
  },
];

export const LeaderboardTable = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50">
            <TableHead className="w-20 font-semibold">Rank</TableHead>
            <TableHead className="font-semibold">Trader</TableHead>
            <TableHead className="font-semibold">Predictions</TableHead>
            <TableHead className="font-semibold">Success Rate</TableHead>
            <TableHead className="font-semibold">ROI</TableHead>
            <TableHead className="font-semibold">24h Change</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {traders.map((trader) => (
            <TableRow key={trader.rank} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50">
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {trader.rank === 1 && <Award className="h-5 w-5 text-yellow-500" />}
                  {trader.rank === 2 && <Medal className="h-5 w-5 text-gray-400" />}
                  {trader.rank === 3 && <Medal className="h-5 w-5 text-amber-600" />}
                  {trader.rank}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      {trader.name}
                      <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full">
                        {trader.badge}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{trader.streak} streak</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{trader.predictions}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">total</div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{trader.successRate}%</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">success</div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="text-green-500 font-medium flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    +{trader.roi}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">total return</div>
                </div>
              </TableCell>
              <TableCell>
                <div className={`flex items-center gap-1 ${trader.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {trader.change24h >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {trader.change24h}%
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};