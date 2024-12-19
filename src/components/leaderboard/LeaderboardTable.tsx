import { CalendarDays } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-20">Rank</TableHead>
          <TableHead>Trader</TableHead>
          <TableHead>Predictions</TableHead>
          <TableHead>Success Rate</TableHead>
          <TableHead>ROI</TableHead>
          <TableHead>24h Change</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {traders.map((trader) => (
          <TableRow key={trader.rank}>
            <TableCell className="font-medium">{trader.rank}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    {trader.name}
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      {trader.badge}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">{trader.streak} streak</div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div>
                <div>{trader.predictions}</div>
                <div className="text-sm text-gray-500">total</div>
              </div>
            </TableCell>
            <TableCell>
              <div>
                <div>{trader.successRate}%</div>
                <div className="text-sm text-gray-500">success</div>
              </div>
            </TableCell>
            <TableCell>
              <div>
                <div className="text-green-500">+{trader.roi}%</div>
                <div className="text-sm text-gray-500">total return</div>
              </div>
            </TableCell>
            <TableCell>
              <div className={`flex items-center gap-1 ${trader.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {trader.change24h >= 0 ? '↗' : '↘'} {trader.change24h}%
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};