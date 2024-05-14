import DashboardLayout from "@/layouts/DashboardLayout";
import React, { useState } from "react";
import { Typography, Card, Divider, Button, Modal } from "antd";
import Box from "@mui/material/Box";
import { TextField, MenuItem } from "@mui/material";
import { PlusOutlined } from "@ant-design/icons";
import EnhancedTable from "@/components/data-table/UserManagementTable";


export default function UserManagementPage() {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [value, setValue] = useState("");

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const role = [
    { value: "admin", label: "Admin" },
    { value: "user", label: "User" }
  ];

  return (
    <DashboardLayout>
      <>
        <Card
          title={<Typography.Title level={1}>
            User Management
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
          >New User</Button>
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
                label="Name"
                variant="outlined"
              />
              <TextField
                label="Password"
                variant="outlined"
                type="password"
                autoComplete="current-password"
              />
              <TextField
                label="Confirm Password"
                variant="outlined"
                type="password"
                autoComplete="current-password"
              />
              <TextField
                select
                label="Role"
                variant="outlined"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              >
                {role.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>


            </div>

          </Box>
        </Modal>

      </>
    </DashboardLayout>
  );
}
