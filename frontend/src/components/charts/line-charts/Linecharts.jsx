import * as React from "react";
import { LineChart } from "@mui/x-charts/LineChart";

export default function Linecharts() {
  return (
    <LineChart
      xAxis={[{ data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }]}
      series={[
        {
          label: "Phishing Success Overview",
          data: [2, 3, 4, 6, 8, 5, 7, 6, 5, 3],
          color: "#778ab0",
          area: true
        },
      ]}
      height={350}
    />
  );
}
