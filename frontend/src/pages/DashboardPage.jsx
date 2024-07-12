import React, { useState, useEffect } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { Divider, Button, Card, Typography } from "antd";
import Linecharts from "@/components/charts/line-charts/Linecharts";
import Donutcharts from "@/components/charts/donut-charts/Donutcharts";
import EnhancedTable from "@/components/data-table/DashboardTable";
import axios from "../middleware/axios";


export default function DashboardPage() {
  const [totalSum, setTotalSum] = useState(0);
  const [successSum, setSuccessSum] = useState(0);

  const [resultData, setResultData] = useState([]);
  const navigate = useNavigate();

  const handleViewAllClick = () => {
    navigate("/campaigns");
  };

  // const axiosPrivate = useAxiosInterceptor();
  const access_token = localStorage.getItem("access_token") || " ";

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const response = await axios.get("campaign/dashboard/", {
        headers: {
          Authorization: `Bearer ${(access_token)}`,
        },
      });

      const data = response.data;

      if (data.result && data.result.length > 0) {
        const campaignData = data.result.map((result) => ({
          cam_id: result.cam_id,
          cam_name: result.cam_name,
          full_create_date_time: result.full_create_date_time,
          total: result.status.total,
          success: result.status.submit,
        }));

        const totalSum = campaignData.reduce(
          (acc, curr) => acc + curr.total,
          0
        );
        const successSum = campaignData.reduce(
          (acc, curr) => acc + curr.success,
          0
        );

        setResultData(campaignData);
        setTotalSum(totalSum);
        setSuccessSum(successSum);
      } else {
        console.log("No result found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <DashboardLayout>
      <>
        <Card
          title={
            <Typography.Title level={1}>
              Dashboard
              <Divider style={{ marginBottom: "0px" }} />
            </Typography.Title>
          }
          bordered={false}
          style={{
            width: "100%",
            borderBottom: "0 2px solid rgba(0, 0, 0, 0.1)",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Linecharts resultData={resultData} />
            <Donutcharts totalSum={totalSum} successSum={successSum} />
          </div>
          <div style={{ paddingBottom: "24px" }}>
            <Typography.Title level={1}>Recent Campaigns</Typography.Title>
          </div>

          <Button
            style={{
              fontSize: "14px",
              width: 100,
              height: 40,
              backgroundColor: "rgb(104,188,131)",
              color: "#FFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={handleViewAllClick}
          >
            VIEW ALL
          </Button>
          <div style={{ marginTop: "30px" }}>
            <EnhancedTable />
          </div>
        </Card>
      </>
    </DashboardLayout>
  );
}