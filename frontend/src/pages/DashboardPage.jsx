import DashboardLayout from "@/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { Divider, Button, Card, Typography } from "antd";
import Linecharts from "@/components/charts/line-charts/Linecharts";
import Donutcharts from "@/components/charts/donut-charts/Donutcharts";
import EnhancedTable from "@/components/data-table/DashboardTable"

export default function DashboardPage() {
  const navigate = useNavigate();

  const handleViewAllClick = () => {
    navigate('/campaigns');
  };
  return (
    <DashboardLayout>
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
          <Linecharts />
          <Donutcharts/>
        </div>
        <div style={{ paddingTop: "30px", paddingBottom: "30px" }}>
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
                justifyContent: "center"
              }}
              onClick={handleViewAllClick}
            >VIEW ALL</Button>
            <div style={{marginTop: "50px"}}>
            <EnhancedTable/>

            </div>
            
            
      </Card>
    </>
    </DashboardLayout>
  );
}
