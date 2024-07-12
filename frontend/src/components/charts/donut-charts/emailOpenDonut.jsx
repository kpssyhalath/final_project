import React, { useState, useEffect } from "react";

import Chart from "react-apexcharts";

const EmailOpenDonut = ({ total, emailopened } ) => {
  total = total?? 0;
  emailopened = emailopened?? 0;

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

  const notOpened = total - emailopened;
  const data = {
    Opened: emailopened,
    "Not Opened": notOpened,
  };

  const options = {
    labels: Object.keys(data),
    colors: ["#f6d320", "#e3e3e3"],
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
              color: "#f6d320",
              offsetY: 6,
              formatter: function (val) {
                return `${emailopened} / ${total}`;

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
                return total === 0 ? "0 %" : `${((emailopened / total) * 100).toFixed(0)} %`;


              },
            },
          },
        },
      },
    },
  };

  const series = [data.Opened, data["Not Opened"]];

  return (
    <div className="chart-container">
      <div className="chart-label-box">
        <p className="chart-label">Opened</p>
        <Chart options={options} series={series} type="donut" width={200} />
      </div>
    </div>
  );
};

export default EmailOpenDonut;