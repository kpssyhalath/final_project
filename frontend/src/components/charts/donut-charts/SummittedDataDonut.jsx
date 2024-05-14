import React from "react";
import Chart from "react-apexcharts";

const SummittedDataDonut = ({ summitdata }) => {
  const blank = 100 - summitdata;
  
  const data = {
    summitdata: 30,
    Blank: blank,
  };

  const options = {
    labels: Object.keys(data),
    colors: ["#e35e3e", "#bebebe"],
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: false,
    },
    tooltip: {
      enabled: false,
    },
  };

  const series = [data.summitdata, data.Blank];

  return (
    <div style={{ padding: "20px"}}>
      <p style={{ margin: 0 , textAlign: "center" }}>Summitted Data</p>
      <Chart options={options} series={series} type="donut" width={200} />
    </div>
  );
};

export default SummittedDataDonut;
