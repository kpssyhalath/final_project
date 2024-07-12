import React, { useState, useEffect } from "react";

import Chart from "react-apexcharts";

const ClickedLinkDonut = ({ total, clickedlink } ) => {
  total = total?? 0;
  clickedlink = clickedlink?? 0;

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300); 
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <div></div>; 
  }


  const notClicked = total - clickedlink;
  const data = {
    Clicked: clickedlink,
    "Not Clicked": notClicked,
  };

  const options = {
    labels: Object.keys(data),
    colors: ["#f8aa23", "#e3e3e3"],
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            name: {
              show: false,
              fontSize: "16px",
              fontWeight: 600,
              color: "#000",
              offsetY: -10,
            },
            value: {
              show: true,
              fontSize: "20px",
              fontWeight: 400,
              color: "#f8aa23",
              offsetY: 6,
              formatter: function (val) {
                return `${clickedlink} / ${total}`;

              },
            },
            total: {
              show: true,
              showAlways: false,
              label: "",
              fontSize: "16px",
              fontWeight: 600,
              color: "#000",
              formatter: function (w) {
                return total === 0 ? "0 %" : `${((clickedlink / total) * 100).toFixed(0)} %`;


              },
            },
          },
        },
      },
    },
  };

  const series = [data.Clicked, data["Not Clicked"]];

  return (
    <div className="chart-container">
      <div className="chart-label-box">
        <p className="chart-label">Clicked</p>
        <Chart options={options} series={series} type="donut" width={200} />
      </div>
    </div>
  );
};

export default ClickedLinkDonut;