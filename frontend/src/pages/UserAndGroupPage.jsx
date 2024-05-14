import DashboardLayout from "@/layouts/DashboardLayout";
import React, { useState } from "react";
import { Upload, Button, message, Typography, Card, Divider, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import EnhancedTable from "@/components/data-table/UserGroupTable";
import EnhancedTable_m from "@/components/data-table/UserGroupPopupTable";

export default function UserAndGroupPage() {

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const props = {
    action: "https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188",
    onChange({ file, fileList }) {
      if (file.status !== "uploading") {
        console.log(file, fileList);
        if (file.type !== "text/csv") {
          message.error("file does not support, please upload .csv file only");
          return false;
        }
      }
      return true;
    },
    showUploadList: {
      showDownloadIcon: true,
      downloadIcon: "Download",
      showRemoveIcon: true,
    },
    beforeUpload(file) {
      if (file.type !== "text/csv") {
        message.error("file does not support, please upload .csv file only");
        return false;
      }
      return true;
    },
  };

  return (
    <DashboardLayout>
      <>
        <Card
          title={<Typography.Title level={1}>
            Group
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
          >New Group</Button>
          <div style={{ marginTop: "10px" }}>
            <EnhancedTable />
          </div>

        </Card>
        <Modal
          title="New Group"
          width={800}
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
          style={{ width: "600px", height: "400px" }}
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
              display: "flex",
              flexDirection: "column",
              "& .MuiTextField-root": { m: 1, width: "98%" },
            }}
            noValidate
            autoComplete="off"
          >
            <TextField
              label="Name"
              variant="outlined"
            />
            <div style={{ display: "flex", gap: 2 }}>
              <TextField
                label="Firstname"
                variant="outlined"
                sx={{ flex: 1 }}
              />
              <TextField
                label="Lastname"
                variant="outlined"
                sx={{ flex: 1 }}
              />
              <TextField
                label="Email"
                variant="outlined"
                sx={{ flex: 1 }}
              />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: "15px" }}>
              <Button
                icon={<PlusOutlined />}
                style={{
                  fontSize: "14px",
                  width: 130,
                  height: 40,
                  backgroundColor: "#ff5252",
                  color: "#FFF",
                  marginLeft: "7px",
                }}
              >Add Item</Button>

              <Upload {...props} >
                <Button
                  style={{
                    fontSize: "14px",
                    width: 130,
                    height: 40,
                    backgroundColor: "#fb8c00",
                    color: "#FFF",
                  }}
                >Import CSV</Button>
              </Upload>

            </div>
            <div style={{ marginTop: "10px" }}>
              <EnhancedTable_m />
            </div>
          </Box>
        </Modal>
      </>
    </DashboardLayout>
  );
}
