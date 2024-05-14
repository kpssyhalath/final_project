import DashboardLayout from "@/layouts/DashboardLayout";
import React, { useState, useRef } from "react";
import { Typography, Card, Divider, Button, Modal } from "antd";
import Box from "@mui/material/Box";
import { PlusOutlined } from "@ant-design/icons";
import TextField from "@mui/material/TextField";
import Button_m from "@mui/material/Button";
import EnhancedTable from "@/components/data-table/LandingPagesTable";
import JoditEditor from "jodit-react";
export default function LandingPage() {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputType, setInputType] = useState("");
  const [activeButton, setActiveButton] = useState("");
  const editor = useRef(null);


  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const handleInputType = (type) => {
    setInputType(type);
    setActiveButton(type);
  };

  return (
    <DashboardLayout>
      <>
        <Card
          title={<Typography.Title level={1}>
            Landing Pages
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
          >New Page</Button>
          <div style={{ marginTop: "10px" }}>
            <EnhancedTable />

          </div>

        </Card>
        <Modal
          title="New Landing Page"
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
                label="URL"
                variant="outlined"
                sx={{ flex: 1 }}
              />
              <TextField
                label="Redirect URL"
                variant="outlined"
                sx={{ flex: 1 }}
              />
            </div>
            <div style={{ marginTop: "40px", marginLeft: "7px", gap: 12 }}>
              <Button_m variant="text" size="large"
                style={{
                  borderRadius: activeButton === "html" ? "0px" : "4px",
                  borderBottom: activeButton === "html" ? "solid" : "none",
                }}
                onClick={() => handleInputType("html")}
              >HTML</Button_m>
            </div>
            {inputType === "html" && (
              <div style={{ marginTop: "20px" }}>
                <JoditEditor
                  ref={editor}
                  config={{
                    height: 400,
                    toolbarAdaptive: false,
                    toolbarButtonSize: "small",
                    toolbar: true,
                    showCharsCounter: false,
                    buttons: "bold,italic,underline,strikethrough,|,align,ul,ol,|,font,fontsize,brush,paragraph",
                    placeholder: "",
                  }}
                />
              </div>

            )}

          </Box>
        </Modal>
      </>
    </DashboardLayout>
  );
}
