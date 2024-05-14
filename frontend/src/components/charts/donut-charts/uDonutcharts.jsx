import React from "react";
import Chart from "react-apexcharts";

const uDonutcharts = () => {
  const data = {
    Successful: 60,
    Unsuccessful: 40,
  };
  const options={
    labels : Object.keys(data),
    colors:["#43bf7d","#e35e5e"],
    legend:{
      position: "bottom",
    },
    dataLabels: {
      enabled: false, 
    },
    stroke: {
      show: false, 
    },

  };

  const series = Object.values(data);

  return <div style={{
    padding: "20px", 
    textAlign: "center",
  }}>
    <p style={{ margin: 0 }}>Phishing Success Overview</p>
    <Chart options={options} series={series} type="donut" width={350}/>
  </div>
};

export default uDonutcharts;