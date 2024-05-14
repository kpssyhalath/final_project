import UDashboardLayout from "@/layouts/UDashboardLayout";
import { Typography, Card, Divider } from "antd";
import Ulinecharts from "@/components/charts/line-charts/Ulinecharts";
import Udonutcharts from "@/components/charts/donut-charts/Udonutcharts";
import EnhancedTable from "@/components/data-table/uDashboardTable";

export default function UDashboardPage() {
  return (
    <UDashboardLayout>
      <>
      <Card
        title={<Typography.Title level={1}>Dashboard
        <Divider />
        </Typography.Title>}
        bordered={false}
        style=
        {{
        width: "100%",
        borderBottom: "0 2px solid rgba(0, 0, 0, 0.1)", 
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)" 
        }}
      >
        
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Ulinecharts />
          <Udonutcharts/>
        </div>
        <div style={{ paddingTop: "10px", paddingBottom: "30px" }}>
        <Typography.Title level={1}>Recent Campaigns</Typography.Title>
        </div>
            <div style={{marginTop: "10px"}}>
            <EnhancedTable/>

            </div>    
      </Card>
    </>
    </UDashboardLayout>
  );
}
