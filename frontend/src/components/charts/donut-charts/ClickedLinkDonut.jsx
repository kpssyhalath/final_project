import React from "react";
import Chart from "react-apexcharts";

const ClickedLinkDonut = ({ clickedlink }) => {
  const blank = 100 - clickedlink;
  
  const data = {
    clickedlink: 50,
    Blank: blank,
  };

  const options = {
    labels: Object.keys(data),
    colors: ["#f8aa23", "#bebebe"],
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

  const series = [data.clickedlink, data.Blank];

  return (
    <div style={{ padding: "20px"}}>
      <p style={{ margin: 0 , textAlign: "center"}}>Clicked Link</p>
      <Chart options={options} series={series} type="donut" width={200} />
    </div>
  );
};

export default ClickedLinkDonut;
