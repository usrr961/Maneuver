import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { calculateAccuracy } from '@/lib/scouterGameUtils';
import type { ScouterChartData, ScouterMetric } from '@/hooks/useScoutDashboard';

interface ScoutTableProps {
  chartData: ScouterChartData[];
  chartMetric: ScouterMetric;
  selectedMetricLabel: string;
}

export function ScoutTable({ chartData, chartMetric, selectedMetricLabel }: ScoutTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8">#</TableHead>
            <TableHead className="min-w-24">Scout Name</TableHead>
            <TableHead className="text-right min-w-16 font-bold">
              {selectedMetricLabel}
            </TableHead>
            {chartMetric !== "stakes" && chartMetric !== "totalStakes" && (
              <TableHead className="text-right min-w-16">Stakes</TableHead>
            )}
            {chartMetric !== "totalPredictions" && (
              <TableHead className="text-right min-w-20">Predictions</TableHead>
            )}
            {chartMetric !== "correctPredictions" && (
              <TableHead className="text-right min-w-16">Correct</TableHead>
            )}
            {chartMetric !== "accuracy" && (
              <TableHead className="text-right min-w-16">Accuracy</TableHead>
            )}
            {chartMetric !== "currentStreak" && (
              <TableHead className="text-right min-w-20">Current Streak</TableHead>
            )}
            {chartMetric !== "longestStreak" && (
              <TableHead className="text-right min-w-20">Best Streak</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {chartData.map((data, index) => {
            const scouter = data.scouter;
            const accuracy = calculateAccuracy(scouter);
            return (
              <TableRow key={scouter.name}>
                <TableCell className="font-medium">
                  <Badge 
                    variant={index >= 3 ? "secondary" : "default"}
                    className={
                      index === 0 ? "bg-yellow-500 text-white hover:bg-yellow-600" : // Gold
                      index === 1 ? "bg-gray-400 text-black hover:bg-gray-500" :     // Silver  
                      index === 2 ? "bg-amber-600 text-white hover:bg-amber-700" :   // Bronze
                      ""
                    }
                  >
                    {index + 1}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{scouter.name}</TableCell>
                <TableCell className="text-right font-bold text-primary">
                  {chartMetric === "accuracy" ? `${data.value}%` : data.value}
                </TableCell>
                {chartMetric !== "stakes" && chartMetric !== "totalStakes" && (
                  <TableCell className="text-right">{scouter.stakes}</TableCell>
                )}
                {chartMetric !== "totalPredictions" && (
                  <TableCell className="text-right">{scouter.totalPredictions}</TableCell>
                )}
                {chartMetric !== "correctPredictions" && (
                  <TableCell className="text-right">{scouter.correctPredictions}</TableCell>
                )}
                {chartMetric !== "accuracy" && (
                  <TableCell className="text-right">
                    <span className={accuracy >= 70 ? "text-green-600 dark:text-green-400" : 
                                   accuracy >= 50 ? "text-yellow-600 dark:text-yellow-400" : 
                                   "text-red-600 dark:text-red-400"}>
                      {accuracy}%
                    </span>
                  </TableCell>
                )}
                {chartMetric !== "currentStreak" && (
                  <TableCell className="text-right">{scouter.currentStreak}</TableCell>
                )}
                {chartMetric !== "longestStreak" && (
                  <TableCell className="text-right">{scouter.longestStreak}</TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
