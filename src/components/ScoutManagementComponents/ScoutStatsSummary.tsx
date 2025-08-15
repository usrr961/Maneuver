import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sigma, TrendingUpDown, Award, Target } from "lucide-react";
import { calculateAccuracy } from '@/lib/scouterGameUtils';
import type { Scouter } from '@/lib/dexieDB';

interface ScoutStatsSummaryProps {
  scouters: Scouter[];
}

export function ScoutStatsSummary({ scouters }: ScoutStatsSummaryProps) {
  const totalPredictions = scouters.reduce((sum, s) => sum + s.totalPredictions, 0);
  const totalStakes = scouters.reduce((sum, s) => sum + s.stakes, 0);
  const avgAccuracy = scouters.length > 0 
    ? Math.round(scouters.reduce((sum, s) => sum + calculateAccuracy(s), 0) / scouters.length)
    : 0;

  return (
    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Scouts</CardTitle>
          <Sigma className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{scouters.length}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
          <TrendingUpDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPredictions}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Stakes</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalStakes}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Accuracy</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgAccuracy}%</div>
        </CardContent>
      </Card>
    </div>
  );
}
