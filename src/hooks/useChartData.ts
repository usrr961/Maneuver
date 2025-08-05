import { useMemo } from "react";

interface ColumnConfig {
  key: string;
  label: string;
  category: string;
  visible: boolean;
  numeric: boolean;
  percentage?: boolean;
}

interface TeamData {
  teamNumber: number;
  eventName: string;
  matchCount: number;
  [key: string]: string | number;
}

export const useChartData = (
  filteredTeamStats: TeamData[],
  chartType: "bar" | "scatter",
  chartMetric: string,
  scatterXMetric: string,
  scatterYMetric: string,
  columnConfig: ColumnConfig[]
) => {
  // Prepare chart data
  const chartData = useMemo(() => {
    if (chartType === "scatter") {
      return filteredTeamStats.map(team => ({
        team: String(team.teamNumber),
        x: typeof team[scatterXMetric] === 'number' ? team[scatterXMetric] as number : 0,
        y: typeof team[scatterYMetric] === 'number' ? team[scatterYMetric] as number : 0,
        eventName: team.eventName,
      }));
    } else {
      return filteredTeamStats
        .map(team => ({
          team: String(team.teamNumber),
          value: typeof team[chartMetric] === 'number' ? team[chartMetric] as number : 0,
          eventName: team.eventName,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 12); // Show top 12 teams for bar chart
    }
  }, [filteredTeamStats, chartMetric, chartType, scatterXMetric, scatterYMetric]);

  // Chart configuration for the shadcn chart component
  const chartConfig = useMemo(() => {
    const xColumn = columnConfig.find(col => col.key === scatterXMetric);
    const yColumn = columnConfig.find(col => col.key === scatterYMetric);
    const selectedColumn = columnConfig.find(col => col.key === chartMetric);
    
    return {
      value: {
        label: selectedColumn?.label || "Value",
        color: "hsl(var(--chart-1))",
      },
      x: {
        label: xColumn?.label || "X Value",
        color: "hsl(var(--chart-1))",
      },
      y: {
        label: yColumn?.label || "Y Value", 
        color: "hsl(var(--chart-2))",
      },
    };
  }, [chartMetric, scatterXMetric, scatterYMetric, columnConfig]);

  return {
    chartData,
    chartConfig,
  };
};
