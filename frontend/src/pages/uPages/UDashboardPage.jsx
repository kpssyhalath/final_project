import React, { useState, useEffect } from "react";

import UDashboardLayout from "@/layouts/UDashboardLayout";
import { Typography, Card, Divider } from "antd";
import Ulinecharts from "@/components/charts/line-charts/uLinecharts";
import Udonutcharts from "@/components/charts/donut-charts/uDonutcharts";
import EnhancedTable from "@/components/data-table/uDashboardTable";
import axios from "../../middleware/axios";

import { jwtDecode } from "jwt-decode";

export default function UDashboardPage() {
  const [totalSum, setTotalSum] = useState(0);
  const [successSum, setSuccessSum] = useState(0);

  const [resultData, setResultData] = useState([]);

  // const axiosPrivate = useAxiosInterceptor();
  const access_token = localStorage.getItem("access_token") || " ";
  const decodedToken = jwtDecode(access_token);
  const uID = decodedToken.user_id;

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const response = await axios.get(`campaign/dashboard/${uID}`, {
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

        const totalSum = campaignData.reduce((acc, curr) => acc + curr.total, 0);
        const successSum = campaignData.reduce((acc, curr) => acc + curr.success, 0);


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
    <UDashboardLayout>
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
            <Ulinecharts resultData={resultData}/>
            <Udonutcharts totalSum={totalSum} successSum = {successSum}/>
          </div>
          <div style={{ paddingTop: "10px", paddingBottom: "10px" }}>
            <Typography.Title level={1}>Recent Campaigns</Typography.Title>
          </div>
          <div style={{ marginTop: "10px" }}>
            <EnhancedTable />
          </div>
        </Card>
      </>
    </UDashboardLayout>
  );
}