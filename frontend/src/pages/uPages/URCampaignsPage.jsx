import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Divider, Button, Modal, Card, Typography } from "antd";
import Linecharts from "@/components/charts/line-charts/Linecharts";
import EnhancedTable from "@/components/data-table/RcampaingsTable"
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AssessmentIcon from "@mui/icons-material/Assessment";
import DeleteIcon from "@mui/icons-material/Delete";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import EmailSentDonut from "@/components/charts/donut-charts/emailSentDonut";
import EmailOpenDonut from "@/components/charts/donut-charts/emailOpenDonut";
import ClickedLinkDonut from "@/components/charts/donut-charts/ClickedLinkDonut";
import SummittedDataDonut from "@/components/charts/donut-charts/SummittedDataDonut";

export default function URCampaignsPage() {
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handlecampaignsClick = () => {
    navigate('/u/campaigns');
  };

  const emailsent = 30;
  const emailopened = 50;
  const clickedlink = 50;
  const summitdata = 70;

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  return (

    <>
      <Card
        title={<Typography.Title level={1}>Results of Campaign
          <Divider />
        </Typography.Title>}
        bordered={false}
        style=
        {{
          width: '100%',
          borderBottom: '0 2px solid rgba(0, 0, 0, 0.1)',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
        }}

      >
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            icon={<ArrowBackIcon fontSize="small" />}
            style={{
              fontSize: "14px",
              width: 100,
              height: 40,
              backgroundColor: "#bebebe",
              color: "#FFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={handlecampaignsClick}
          >BACK
          </Button>
          <Button
            icon={<AssessmentIcon fontSize="small" />}
            style={{
              fontSize: "14px",
              width: 170,
              height: 40,
              backgroundColor: "#236cfe",
              color: "#FFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >Export As CSV
          </Button>
          <Button
            icon={<DeleteIcon fontSize="small" />}
            style={{
              fontSize: "14px",
              width: 120,
              height: 40,
              backgroundColor: "#4caf50",
              color: "#FFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={showModal}
          >Delete
          </Button>
          <Button
            icon={<AutorenewIcon fontSize="small" />}
            style={{
              fontSize: "14px",
              width: 130,
              height: 40,
              backgroundColor: "#7fa0fb",
              color: "#FFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            loading={refreshing}
            onClick={handleRefresh}
          >Refresh
          </Button>
        </div>
        <Divider />
        <Typography.Title level={1}>Sales Branch
          <Divider />
        </Typography.Title>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Linecharts />
        </div>
        <div style={{ display: 'flex'}}>
          <EmailSentDonut emailsent={emailsent} />
          <EmailOpenDonut emailopened={emailopened}/>
          <ClickedLinkDonut clickedlink={clickedlink}/>
          <SummittedDataDonut summitdata={summitdata}/>
        </div>
        <div style={{ paddingTop: '10px', paddingBottom: '30px' }}>
          <Typography.Title level={1}>Details</Typography.Title>
        </div>
        <div style={{ marginTop: '10px' }}>
          <EnhancedTable />
        </div>
      </Card>
      <Modal
        title="Delete Item"
        centered
        open={isModalOpen}
        onCancel={handleCancel}
        cancelButtonProps={{
          style: {
            backgroundColor: "#ff5252",
            color: "#FFF",
            fontSize: "13px",
            height: "36px",
          }
        }}
        cancelText="CANCEL"
        footer={(_, { CancelBtn }) => (
          <>
            <CancelBtn
            />
            <Button
              style={{
                borderColor: "rgba(67,190,126,255)",
                color: "rgba(67,190,126,255)",
                fontSize: "13px",
                height: "36px",
              }}
            >OK</Button>
          </>
        )}
      >
        <Typography>
          Are you sure you want to delete this item?
        </Typography>
      </Modal>
    </>
  );
}


