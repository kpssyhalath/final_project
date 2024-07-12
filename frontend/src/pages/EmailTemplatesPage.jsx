import React, { useState, useRef } from "react";
import { Divider, Button, Modal, Card, Typography } from "antd";
import {
  Box,
  TextField,
  Button as Button_m,
  IconButton,
  Alert,
  AlertTitle,
  Collapse,
} from "@mui/material";
import { PlusOutlined } from "@ant-design/icons";
import CloseIcon from "@mui/icons-material/Close";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "@/layouts/DashboardLayout";
import EnhancedTable from "@/components/data-table/EmailTemplatesTable";
import axios from "../middleware/axios";


import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";

export default function EmailTemplatesPage() {
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
  const [templateNameTouched, setTemplateNameTouched] = useState(false);
  const [subjectTouched, setSubjectTouched] = useState(false);

  const [formData, setFormData] = useState({
    temp_name: "",
    subject: "",
    text_data: "",
    html_data: "",
  });
  const navigate = useNavigate();

  const showTemplateNameError = templateNameTouched && !formData.temp_name;
  const showSubjectError = subjectTouched && !formData.subject;

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

  // const axiosPrivate = useAxiosInterceptor();
  const access_token = localStorage.getItem("access_token") || " ";

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

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

  //Create Email Template Page
  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post("email_template/", formData, {
        headers: {
          Authorization: `Bearer ${(access_token)}`,
        },
      });

      setAlertSeverity("success");
      setServerResponse(response.data.msg);
      setShow(true);

      setFormData({
        temp_name: "",
        subject: "",
        text_data: "",
        html_data: "",
      });

      setTemplateNameTouched(false);
      setSubjectTouched(false);

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
    console.log(formData);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    navigate(`/refresh`);
    setTimeout(() => {
      navigate(`/email-templates`);

      setRefreshing(false);
    });
  };

  return (
    <DashboardLayout>
      <>
        <Card
          title={
            <Typography.Title level={1}>
              Email Templates
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
                width: 170,
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
              New Template
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
          <Modal
            title="New Template"
            width={800}
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
                "& .MuiTextField-root": { m: 1, width: "100%" },
              }}
              noValidate
              autoComplete="off"
            >
              <div>
                <TextField
                  error={showTemplateNameError}
                  helperText={
                    showTemplateNameError ? "Template name is required" : ""
                  }
                  label="Template Name"
                  name="temp_name"
                  value={formData.temp_name || ""}
                  onBlur={() => setTemplateNameTouched(true)}
                  onChange={handleFormChange}
                  variant="outlined"
                />
                <TextField
                  error={showSubjectError}
                  helperText={
                    showSubjectError ? "Subject name is required" : ""
                  }
                  label="Subject"
                  name="subject"
                  onBlur={() => setSubjectTouched(true)}
                  value={formData.subject || ""}
                  onChange={handleFormChange}
                  variant="outlined"
                />
              </div>
              <div style={{ marginLeft: "7px", gap: 12 }}>
                <Button_m
                  variant="text"
                  size="large"
                  style={{
                    borderRadius: activeButton === "text" ? "0px" : "4px",
                    borderBottom: activeButton === "text" ? "solid" : "none",
                  }}
                  onClick={() => handleInputType("text")}
                >
                  Text
                </Button_m>
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
                      borderBottom:
                        activeButton === "render" ? "solid" : "none",
                    }}
                    onClick={handleRenderButtonClick}
                  >
                    Render
                  </Button_m>
                )}
              </div>
              {inputType === "text" && (
                <TextField
                  style={{
                    minWidth: 500,
                  }}
                  label="Plaintext"
                  name="text_data"
                  value={formData.text_data || ""}
                  onChange={handleFormChange}
                  multiline={true}
                  rows="16"
                  // rowsMax="25"
                  variant="outlined"
                  fullWidth={true}
                  placeholder='Have to provide "Click Here" in the Text for direct to the landing page'
                />
              )}
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
                      style={{
                        border: "1px solid #e5e5e5",
                        borderRadius: "4px",
                      }}
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
                      top: "267px",
                      right: "25px",
                      zIndex: 1000,
                      backgroundColor: "transparent",
                      color: "#1976d2",
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
        </Card>
      </>
    </DashboardLayout>
  );
}