import React, { useState, useEffect, useMemo } from 'react';
import { ScouterProfileWithSelector } from '../components/GameComponents/ScouterProfileWithSelector';
import { AchievementOverview } from '../components/ScoutManagementComponents/AchievementOverview';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GenericSelector } from "@/components/ui/generic-selector";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Trophy, Target, Award, Sigma, TrendingUpDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, LineChart, Line, Legend } from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { getAllScouters, calculateAccuracy } from '@/lib/scouterGameUtils';
import type { Scouter } from '@/lib/dexieDB';
import { analytics } from '@/lib/analytics';
import { useCurrentScouter } from '@/hooks/useCurrentScouter';
import { useNavigate } from 'react-router-dom';

type ScouterMetric = "stakes" | "totalPredictions" | "correctPredictions" | "accuracy" | "currentStreak" | "longestStreak";

interface ScouterChartData {
  name: string;
  value: number;
  scouter: Scouter;
}

const ScoutManagementDashboardPage: React.FC = () => {
  const [scouters, setScouters] = useState<Scouter[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartMetric, setChartMetric] = useState<ScouterMetric>("stakes");
  const [chartType, setChartType] = useState<"bar" | "line" | "table">("bar");
  const { currentScouter } = useCurrentScouter();
  const navigate = useNavigate();

  const metricOptions = [
    { key: "stakes", label: "Stakes", icon: Trophy },
    { key: "totalPredictions", label: "Total Predictions", icon: Target },
    { key: "correctPredictions", label: "Correct Predictions", icon: Award },
    { key: "accuracy", label: "Accuracy %", icon: TrendingUp },
    { key: "currentStreak", label: "Current Streak", icon: TrendingUp },
    { key: "longestStreak", label: "Best Streak", icon: Award },
  ];

  useEffect(() => {
    const loadScoutData = async () => {
      setLoading(true);
      try {
        const scoutData = await getAllScouters();
        setScouters(scoutData);
        analytics.trackEvent('scout_dashboard_loaded', { scoutCount: scoutData.length });
      } catch (error) {
        console.error('❌ Error loading scout data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadScoutData();
  }, []);

  const chartData = useMemo(() => {
    return scouters
      .map(scouter => {
        let value: number;
        switch (chartMetric) {
          case "accuracy":
            value = calculateAccuracy(scouter);
            break;
          default:
            value = scouter[chartMetric] as number;
        }
        
        return {
          name: scouter.name,
          value,
          scouter
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 12);
  }, [scouters, chartMetric]);

  // Line chart data - shows progression over number of matches
  const lineChartData = useMemo(() => {
    if (chartType !== "line" || scouters.length === 0) return [];
    
    // For line chart, we'll simulate progression data
    // In a real implementation, you'd fetch historical prediction data
    const maxMatches = Math.max(...scouters.map(s => s.totalPredictions));
    const dataPoints: Array<{ matchNumber: number; [scouterName: string]: number }> = [];
    
    // Create data points for each match number
    for (let matchNum = 1; matchNum <= Math.min(maxMatches, 20); matchNum++) {
      const point: { matchNumber: number; [scouterName: string]: number } = { matchNumber: matchNum };
      
      // For each scout, calculate their metric value at this point in time
      scouters.slice(0, 6).forEach((scouter) => {
        if (scouter.totalPredictions >= matchNum) {
          let value: number;
          switch (chartMetric) {
            case "accuracy":
              // Simulate accuracy progression (in real app, calculate from historical data)
              value = Math.min(100, (scouter.correctPredictions / matchNum) * 100);
              break;
            case "stakes":
              // Simulate stakes progression
              value = Math.floor((scouter.stakes / scouter.totalPredictions) * matchNum);
              break;
            case "currentStreak":
              // For streaks, just show current value after they reach that point
              value = matchNum === scouter.totalPredictions ? scouter.currentStreak : 0;
              break;
            case "longestStreak":
              // Simulate longest streak growth
              value = Math.floor((scouter.longestStreak / scouter.totalPredictions) * matchNum);
              break;
            default:
              value = Math.floor((scouter[chartMetric] as number / scouter.totalPredictions) * matchNum);
          }
          point[scouter.name] = value;
        }
      });
      
      dataPoints.push(point);
    }
    
    return dataPoints;
  }, [scouters, chartMetric, chartType]);

  // Chart configuration
  const chartConfig = {
    value: {
      label: metricOptions.find(opt => opt.key === chartMetric)?.label || "Value",
      color: "hsl(210, 70%, 50%)",
    },
  };

  const selectedMetricInfo = metricOptions.find(opt => opt.key === chartMetric);
  const Icon = selectedMetricInfo?.icon || Trophy;

  return (
    <div className="min-h-screen container mx-auto p-4 space-y-6">
      <div className="text-start space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Scout Management Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor scout performance and leaderboards
            </p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col w-full justify-between md:flex-row items-start md:items-center gap-4">
            <div className="flex flex-col w-full">
              <CardTitle className="flex items-start gap-2 pb-2">
                <Icon className="h-5 w-5" />
                Scout {chartType === "table" ? "Statistics" : "Leaderboard"}
              </CardTitle>
              <CardDescription className="px-4">
                {chartType === "table" 
                  ? `Detailed scout statistics sorted by ${selectedMetricInfo?.label.toLowerCase()}`
                  : `Top performing scouts by ${selectedMetricInfo?.label.toLowerCase()}`
                }
              </CardDescription>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-2 w-full">
              <div className="flex items-center gap-2">
                <p className="whitespace-nowrap">Metric:</p>
                <GenericSelector
                  label="Select Metric"
                  value={chartMetric}
                  availableOptions={metricOptions.map(opt => opt.key)}
                  onValueChange={(value) => setChartMetric(value as ScouterMetric)}
                  placeholder="Select metric"
                  displayFormat={(key) => metricOptions.find(opt => opt.key === key)?.label || key}
                  className="w-auto max-w-40"
                />
              </div>
              <div className="flex items-center gap-2">
                <p className="whitespace-nowrap">View:</p>
                <GenericSelector
                  label="Select View Type"
                  value={chartType}
                  availableOptions={["bar", "line", "table"]}
                  onValueChange={(value) => setChartType(value as "bar" | "line" | "table")}
                  placeholder="Select view type"
                  displayFormat={(key) => {
                    switch(key) {
                      case "bar": return "Bar Chart";
                      case "line": return "Line Chart";
                      case "table": return "Table";
                      default: return key;
                    }
                  }}
                  className="w-auto max-w-32"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading scout data...</p>
              </div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400">No scout data available</p>
                <p className="text-sm text-gray-500">Create scouts and make predictions to see the leaderboard</p>
              </div>
            </div>
          ) : (
            <>
              {chartType === "table" ? (
                <div className="w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8">#</TableHead>
                        <TableHead>Scout Name</TableHead>
                        <TableHead className="text-right">Stakes</TableHead>
                        <TableHead className="text-right">Predictions</TableHead>
                        <TableHead className="text-right">Correct</TableHead>
                        <TableHead className="text-right">Accuracy</TableHead>
                        <TableHead className="text-right">Current Streak</TableHead>
                        <TableHead className="text-right">Best Streak</TableHead>
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
                            <TableCell className="text-right">{scouter.stakes}</TableCell>
                            <TableCell className="text-right">{scouter.totalPredictions}</TableCell>
                            <TableCell className="text-right">{scouter.correctPredictions}</TableCell>
                            <TableCell className="text-right">
                              <span className={accuracy >= 70 ? "text-green-600 dark:text-green-400" : 
                                             accuracy >= 50 ? "text-yellow-600 dark:text-yellow-400" : 
                                             "text-red-600 dark:text-red-400"}>
                                {accuracy}%
                              </span>
                            </TableCell>
                            <TableCell className="text-right">{scouter.currentStreak}</TableCell>
                            <TableCell className="text-right">{scouter.longestStreak}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <ChartContainer config={chartConfig} className="h-[400px] w-full">
                  {chartType === "bar" ? (
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <ChartTooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload as ScouterChartData;
                            const scouter = data.scouter;
                            const accuracy = calculateAccuracy(scouter);
                            
                            return (
                              <div className="bg-white dark:bg-gray-800 p-3 border rounded shadow-lg">
                                <p className="font-semibold">{scouter.name}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {selectedMetricInfo?.label}: {data.value}{chartMetric === "accuracy" ? "%" : ""}
                                </p>
                                <div className="mt-2 text-xs space-y-1">
                                  <p>Stakes: {scouter.stakes}</p>
                                  <p>Predictions: {scouter.totalPredictions}</p>
                                  <p>Accuracy: {accuracy}%</p>
                                  <p>Current Streak: {scouter.currentStreak}</p>
                                  <p>Best Streak: {scouter.longestStreak}</p>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]}>
                        {chartData.map((_, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={`hsl(${210 + index * 15}, 70%, 50%)`}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  ) : (
                    <LineChart data={lineChartData} margin={{ top: 50, right: 30, left: 20, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="matchNumber" 
                        tick={{ fontSize: 12 }}
                        label={{ value: 'Match Number', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <ChartTooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white dark:bg-gray-800 p-3 border rounded shadow-lg">
                                <p className="font-semibold">Match {label}</p>
                                {payload.map((entry, index) => (
                                  <p key={index} className="text-sm" style={{ color: entry.color }}>
                                    {entry.dataKey}: {entry.value}{chartMetric === "accuracy" ? "%" : ""}
                                  </p>
                                ))}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend 
                        verticalAlign="top" 
                        height={36}
                        wrapperStyle={{ paddingBottom: '10px' }}
                      />
                      {scouters.slice(0, 6).map((scouter, index) => (
                        <Line 
                          key={scouter.name}
                          type="monotone" 
                          dataKey={scouter.name} 
                          stroke={`hsl(${210 + index * 50}, 70%, 50%)`}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          connectNulls={false}
                        />
                      ))}
                    </LineChart>
                  )}
                </ChartContainer>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Profile and Stats Section - Combined on larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* Profile Section - Takes 2 columns on large screens */}
        <div className="lg:col-span-2 flex justify-center lg:justify-start">
          <ScouterProfileWithSelector />
        </div>

        {/* Achievement Overview - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          {currentScouter ? (
            <AchievementOverview 
              scouterName={currentScouter.name} 
              onViewAll={() => navigate('/achievements')}
              onDataRefresh={async () => {
                const scoutData = await getAllScouters();
                setScouters(scoutData);
              }}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Select a scout to view achievements</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stats Summary - Takes 3 columns on large screens, stacked on smaller */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scouts</CardTitle>
            <Sigma className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scouters.length}</div>
          </CardContent>
        </Card>          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
              <TrendingUpDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {scouters.reduce((sum, s) => sum + s.totalPredictions, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stakes</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {scouters.reduce((sum, s) => sum + s.stakes, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Accuracy</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {scouters.length > 0 
                  ? Math.round(scouters.reduce((sum, s) => sum + calculateAccuracy(s), 0) / scouters.length)
                  : 0}%
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ScoutManagementDashboardPage;
