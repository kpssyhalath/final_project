import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";

const Donutcharts = ({ totalSum, successSum }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  totalSum = totalSum ?? 0;
  successSum = successSum ?? 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <div></div>;
  }

  const data = {
    Successful: successSum,
    Unsuccessful: totalSum - successSum,
  };

  const options = {
    labels: Object.keys(data),
    colors: ["#43bf7d", "#e35e5e"],
    legend: {
      position: "bottom",
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
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
              fontSize: "24px",
              fontWeight: 400,
              color: hoveredIndex === 0 ? "#43bf7d" : hoveredIndex === 1 ? "#e35e5e" : "rgba(67,190,126,255)",
              offsetY: 6,
              formatter: function (val, { seriesIndex }) {
                if (hoveredIndex === 0) {
                  return `${successSum} / ${totalSum}`;
                } else if (hoveredIndex === 1) {
                  return `${totalSum - successSum} / ${totalSum}`;
                } else {
                  return `${successSum} / ${totalSum}`;
                }
              },
            },
          },
        },
      },
    },
    chart: {
      events: {
        dataPointMouseEnter: function (event, chartContext, config) {
          setHoveredIndex(config.dataPointIndex);
        },
        dataPointMouseLeave: function (event, chartContext, config) {
          setHoveredIndex(null);
        },
      },
    },
  };

  const series = Object.values(data);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <p style={{ margin: 0 }}>Phishing Success Overview</p>
      <Chart options={options} series={series} type="donut" width={300} />
    </div>
  );
};

export default Donutcharts;