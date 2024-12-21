import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "react-router-dom";
import { TraderMetrics } from "@/components/traders/TraderMetrics";
import { TraderBadge } from "@/components/traders/TraderBadge";

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
              <TableCell>
                <TraderBadge rank={trader.rank} badge={trader.badge} streak={trader.streak} />
              </TableCell>
              <TableCell>
                <Link to={`/profile/${trader.name}`} className="hover:text-blue-600 transition-colors">
                  {trader.name}
                </Link>
              </TableCell>
              <TraderMetrics
                predictions={trader.predictions}
                successRate={trader.successRate}
                roi={trader.roi}
                change24h={trader.change24h}
              />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
