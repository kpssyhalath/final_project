import React, { useState, useEffect } from "react";

import Chart from "react-apexcharts";

const EmailSentDonut = ({ total, emailsent }) => {
  total = total ?? 0;
  emailsent = emailsent ?? 0;

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

  const notSent = total - emailsent;
  const data = {
    Sent: emailsent,
    "Not Sent": notSent,
  };

  const options = {
    labels: Object.keys(data),
    colors: ["#43bf7d", "#e3e3e3"],
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
              color: "#43bf7d",
              offsetY: 6,
              formatter: function (val) {
                return `${emailsent} / ${total}`;

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
                return total === 0 ? "0 %" : `${((emailsent / total) * 100).toFixed(0)} %`;
              },
            },
          },
        },
      },
    },
  };

  const series = [data.Sent, data["Not Sent"]];

  return (
    <div className="chart-container">
      <div className="chart-label-box">
        <p className="chart-label">Sent</p>
        <Chart options={options} series={series} type="donut" width={200} />
      </div>
    </div>
  );
};

export default EmailSentDonut;