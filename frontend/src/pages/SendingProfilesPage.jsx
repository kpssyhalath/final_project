import DashboardLayout from "@/layouts/DashboardLayout";
import React, { useState } from "react";
import { Typography, Card, Divider, Button, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import EnhancedTable from "@/components/data-table/SendingProfilesTable";

export default function SendingProfilesPage() {

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <DashboardLayout>
      <>
        <Card
          title={<Typography.Title level={1}>
            Sending Profiles
            <Divider />
          </Typography.Title>}
          bordered={false}
          style={{
            width: "100%",
            borderBottom: "0 2px solid rgba(0, 0, 0, 0.1)",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)"

          }}
        >
          <Button
            icon={<PlusOutlined />}
            style={{
              fontSize: "14px",
              width: 140,
              height: 40,
              backgroundColor: "rgb(104,188,131)",
              color: "#FFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bottom: "25px"
            }}
            onClick={showModal}
          >New Profile</Button>
          <div style={{ marginTop: "10px" }}>
            <EnhancedTable />

          </div>


        </Card>
        <Modal
          title="New Sending Profile"
          centered
          open={isModalOpen}
          onCancel={handleCancel}
          cancelButtonProps={{
            style: {
              backgroundColor: "#bebebe",
              color: "#FFF",
              fontSize: "13px",
              height: "36px"
            }
          }}
          cancelText="CANCEL"

          footer={(_, { CancelBtn }) => (
            <>
              <CancelBtn

              />
              <Button
                style={{
                  backgroundColor: "rgba(67,190,126,255)",
                  color: "#FFF",
                  fontSize: "13px",
                  height: "36px"
                }}
              >SAVE</Button>
            </>
          )}
        >
          <Divider style={{ borderTopColor: "#d5d5d5" }} />
          <Box
            component="form"
            sx={{
              "& .MuiTextField-root": { m: 1, width: "98%" },
            }}
            noValidate
            autoComplete="off"
          >
            <div>
              <TextField
                label="Profile Name"
                variant="outlined"
              />
              <TextField
                disabled
                label="Interface Type"
                variant="outlined"
                defaultValue="SMTP"
              />
              <TextField
                label="From"
                variant="outlined"
                placeholder="First Last <test@example.com>"
              />
              <TextField
                label="Host"
                variant="outlined"
                placeholder="smtp.example.com:25"
              />
              <TextField
                label="Username"
                variant="outlined"
              />
              <TextField
                label="Password"
                variant="outlined"
                type="password"
                autoComplete="current-password"
              />

            </div>


          </Box>

        </Modal>

      </>
    </DashboardLayout>
  );
}
