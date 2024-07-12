import React, { useState, useEffect } from "react";

import Chart from "react-apexcharts";

const SummittedDataDonut = ({ total, submitted }) => {
  
  total = total ?? 0;
  submitted = submitted ?? 0;

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

  const notSubmitted = total - submitted;
  const data = {
    Submitted: submitted,
    "Not Submitted": notSubmitted,
  };

  const options = {
    labels: Object.keys(data),
    colors: ["#e35e3e", "#e3e3e3"],
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
              color: "#e35e3e",
              offsetY: 6,
              formatter: function (val) {
                return `${submitted} / ${total}`;
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
                return total === 0 ? "0 %" : `${((submitted / total) * 100).toFixed(0)} %`;
              },
            },
          },
        },
      },
    },
  };

  const series = [data.Submitted, data["Not Submitted"]];

  return (
    <div className="chart-container">
      <div className="chart-label-box">
        <p className="chart-label">Submitted</p>
        <Chart options={options} series={series} type="donut" width={200} />
      </div>
    </div>
  );
};

export default SummittedDataDonut;