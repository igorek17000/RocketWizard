import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function App({
  chartData,
  color,
  extra = 150,
  width = null,
  height = null,
  aspectRatio = 1,
}) {
  const labels = Array(chartData.length).fill("");

  const options = {
    aspectRatio,
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      y: {
        display: false,
        max: Math.max(...chartData) + extra,
        min: Math.min(...chartData) - extra,
        grid: {
          display: false,
        },
      },
      x: {
        display: false,
        grid: {
          display: false,
        },
      },
    },
  };

  const data = {
    labels,
    datasets: [
      {
        label: "",
        data: chartData,
        borderColor: color,
        fill: false,
        cubicInterpolationMode: "monotone",
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  return <Line options={options} data={data} height={height} width={width} />;
}
