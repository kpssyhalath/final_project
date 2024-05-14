import React from "react";
import Chart from "react-apexcharts";

const emailOpenDonut = ({ emailopened }) => {
  const blank = 100 - emailopened;
  
  const data = {
    emailopened: 30,
    Blank: blank,
  };

  const options = {
    labels: Object.keys(data),
    colors: ["#f6d320", "#bebebe"],
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

  const series = [data.emailopened, data.Blank];

  return (
    <div style={{ padding: "20px"}}>
      <p style={{ margin: 0 , textAlign: "center" }}>Email Opened</p>
      <Chart options={options} series={series} type="donut" width={200} />
    </div>
  );
};

export default emailOpenDonut;
