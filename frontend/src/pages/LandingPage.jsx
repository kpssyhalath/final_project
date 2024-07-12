import React, { useState, useRef } from "react";
import {
  TextField,
  Box,
  IconButton,
  Alert,
  AlertTitle,
  Collapse,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Typography, Card, Divider, Button, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import Button_m from "@mui/material/Button";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import { useNavigate } from "react-router-dom";

import EnhancedTable from "@/components/data-table/LandingPagesTable";
import DashboardLayout from "@/layouts/DashboardLayout";
import axios from "../middleware/axios";

import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";

export default function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [inputType, setInputType] = useState("");
  const [activeButton, setActiveButton] = useState("");
  const [htmlButtonClicked, setHtmlButtonClicked] = useState(false);
  const iframeRef = useRef(null);

  // Alert
  const [show, setShow] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("error");
  const [serverResponse, setServerResponse] = useState("");

  // require
  const [PageNameTouched, setPageNameTouched] = useState(false);

  const [formData, setFormData] = useState({
    page_name: "",
    url: "",
    redirectURL: "",
    html_data: "",
  });
  const navigate = useNavigate();

  // require
  const showPageNameError = PageNameTouched && !formData.page_name;

  const handleHtmlButtonClick = () => {
    setInputType("html");
    setActiveButton("html");
    setHtmlButtonClicked(true);
  };

  const handleRenderButtonClick = () => {
    setInputType("render");
    setActiveButton("render");
    const iframe = iframeRef.current;

    if (iframe) {
      iframe.srcdoc = formData.html_data;
    }
  };

  const handleFullscreen = () => {
    const iframe = iframeRef.current;

    if (iframe) {
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      } else if (iframe.mozRequestFullScreen) {
        /* Firefox */
        iframe.mozRequestFullScreen();
      } else if (iframe.webkitRequestFullscreen) {
        /* Chrome, Safari and Opera */
        iframe.webkitRequestFullscreen();
      } else if (iframe.msRequestFullscreen) {
        /* IE/Edge */
        iframe.msRequestFullscreen();
      }
    }
  };

  // const axiosPrivate = useAxiosInterceptor();

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const access_token = localStorage.getItem("access_token");

  //Create Landging Page
  const onSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post("landing_page/", formData, {
        headers: {
          Authorization: `Bearer ${(access_token)}`,
        },
      });

      setAlertSeverity("success");
      setServerResponse(response.data.msg);
      setShow(true);

      setFormData({
        page_name: "",
        url: "",
        redirectURL: "",
        html_data: "",
      });

      setPageNameTouched(false);

      setTimeout(() => {
        setShow(false);
        setIsModalOpen(false);
      }, 1500);
    } catch (error) {
      setAlertSeverity("error");
      setServerResponse(error.response.data.msg);
      console.log(serverResponse);
      setShow(true);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    navigate(`/refresh`);
    setTimeout(() => {
      navigate(`/landing-pages`);

      setRefreshing(false);
    });
  };

  return (
    <DashboardLayout>
      <>
        <Card
          title={
            <Typography.Title level={1}>
              Landing Pages
              <Divider />
            </Typography.Title>
          }
          bordered={false}
          style={{
            width: "100%",
            borderBottom: "0 2px solid rgba(0, 0, 0, 0.1)",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "10px",
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
                bottom: "25px",
              }}
              onClick={showModal}
            >
              New Page
            </Button>
            <Button
              icon={<AutorenewIcon fontSize="small" />}
              style={{
                fontSize: "14px",
                width: 110,
                height: 40,
                backgroundColor: "#7fa0fb",
                color: "#FFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bottom: "25px",
              }}
              loading={refreshing}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
          </div>
          <div style={{ marginTop: "10px" }}>
            <EnhancedTable />
          </div>
        </Card>
        <Modal
          title="New Landing Page"
          width={800}
          style={{ top: 10 }}
          centered
          open={isModalOpen}
          onCancel={handleCancel}
          cancelButtonProps={{
            style: {
              backgroundColor: "#bebebe",
              color: "#FFF",
              fontSize: "13px",
              height: "36px",
            },
          }}
          cancelText="CANCEL"
          footer={(_, { CancelBtn }) => (
            <>
              <CancelBtn />
              <Button
                style={{
                  backgroundColor: "rgba(67,190,126,255)",
                  color: "#FFF",
                  fontSize: "13px",
                  height: "36px",
                }}
                onClick={onSubmit}
              >
                SAVE
              </Button>
            </>
          )}
        >
          <Divider style={{ borderTopColor: "#d5d5d5" }} />
          {show ? (
            <>
              <Box sx={{ width: "100%" }}>
                <Collapse in={show}>
                  <Alert
                    severity={alertSeverity}
                    action={
                      <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={() => {
                          setShow(false);
                        }}
                      >
                        <CloseIcon fontSize="inherit" />
                      </IconButton>
                    }
                    sx={{ mb: 2 }}
                  >
                    <AlertTitle>
                      {alertSeverity === "success" ? "Success" : "Error"}
                    </AlertTitle>
                    <span>{serverResponse}</span>
                  </Alert>
                </Collapse>
              </Box>
            </>
          ) : null}
          <Box
            component="form"
            sx={{
              "& .MuiTextField-root": { m: 1, width: "98%" },
            }}
            noValidate
            autoComplete="off"
            onSubmit={onSubmit}
          >
            <TextField
              error={showPageNameError}
              helperText={
                showPageNameError ? "Landing Page name is required" : ""
              }
              label="Name"
              name="page_name"
              variant="outlined"
              value={formData.page_name}
              onBlur={() => setPageNameTouched(true)}
              onChange={handleFormChange}
            />
            <div style={{ display: "flex", gap: 2 }}>
              <TextField
                label="URL"
                name="url"
                variant="outlined"
                sx={{ flex: 1 }}
                value={formData.url}
                onChange={handleFormChange}
              />
              <TextField
                label="Redirect URL"
                name="redirectURL"
                variant="outlined"
                sx={{ flex: 1 }}
                value={formData.redirectURL}
                onChange={handleFormChange}
              />
            </div>
            <div style={{ marginTop: "10px", marginLeft: "7px", gap: 12 }}>
              <Button_m
                variant="text"
                size="large"
                style={{
                  borderRadius: activeButton === "html" ? "0px" : "4px",
                  borderBottom: activeButton === "html" ? "solid" : "none",
                }}
                onClick={handleHtmlButtonClick}
              >
                HTML
              </Button_m>
              {htmlButtonClicked && (
                <Button_m
                  variant="text"
                  size="large"
                  style={{
                    borderRadius: activeButton === "render" ? "0px" : "4px",
                    borderBottom: activeButton === "render" ? "solid" : "none",
                  }}
                  onClick={handleRenderButtonClick}
                >
                  Render
                </Button_m>
              )}
            </div>
            {inputType === "html" && (
              <div style={{ marginTop: "10px" }}>
                <CodeMirror
                  value={formData.html_data || ""}
                  onChange={(value, viewUpdate) =>
                    setFormData((prevData) => ({
                      ...prevData,
                      html_data: value,
                    }))
                  }
                  height="400px"
                  theme={vscodeDark}
                  extensions={[javascript({ jsx: true }), html()]}
                  placeholder={"Code here..."}
                  style={{ border: "1px solid #e5e5e5", borderRadius: "4px" }}
                />
              </div>
            )}
            {inputType === "render" && (
              <div style={{ marginTop: "10px" }}>
                {formData.html_data ? (
                  <iframe
                    ref={iframeRef}
                    title="Rendered HTML"
                    width="100%"
                    height="400px"
                    style={{ border: "1px solid #e5e5e5", borderRadius: "4px" }}
                  />
                ) : (
                  <div
                    style={{
                      border: "1px solid #e5e5e5",
                      borderRadius: "4px",
                      height: "400px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#999",
                    }}
                  >
                    No HTML content to display
                  </div>
                )}
                <Button_m
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={handleFullscreen}
                  style={{
                    position: "absolute",
                    top: "275px",
                    right: "25px",
                    zIndex: 1000,
                    backgroundColor: "transparent",
                    color: '#1976d2',
                    padding: "5px 10px",
                    fontSize: "12px",
                  }}
                >
                  Fullscreen
                </Button_m>
              </div>
            )}
          </Box>
        </Modal>
      </>
    </DashboardLayout>
  );
}