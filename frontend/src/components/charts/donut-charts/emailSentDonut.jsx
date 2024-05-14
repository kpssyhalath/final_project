import React from "react";
import Chart from "react-apexcharts";

const emailSentDonut = ({ emailsent }) => {
  const blank = 100 - emailsent;
  
  const data = {
    emailsent: 30,
    Blank: blank,
  };

  const options = {
    labels: Object.keys(data),
    colors: ["#43bf7d", "#bebebe"],
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

  const series = [data.emailsent, data.Blank];

  return (
    <div style={{ padding: "20px"}}>
      <p style={{ margin: 0 , textAlign: "center"}}>Email Sent</p>
      <Chart options={options} series={series} type="donut" width={200} />
    </div>
  );
};

export default emailSentDonut;
