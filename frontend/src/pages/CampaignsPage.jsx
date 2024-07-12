import DashboardLayout from "@/layouts/DashboardLayout";
import React, { useState, useEffect } from "react";
import { Divider, Button, Modal, Card, Typography } from "antd";

import CloseIcon from "@mui/icons-material/Close";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import { useNavigate } from "react-router-dom";
import { PlusOutlined } from "@ant-design/icons";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import {
  TextField,
  MenuItem,
  Box,
  IconButton,
  Alert,
  AlertTitle,
  Collapse,
} from "@mui/material";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import EnhancedTable from "@/components/data-table/CampaignsTable";
import axios from "../middleware/axios";

import dayjs from "dayjs";

export default function CampaignsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [endDate, setEndDate] = useState(null);
  const [userBelongOptions, setUserBelongOptions] = useState([]);
  const [emailTemplateOptions, setEmailTemplateOptions] = useState([]);
  const [landingPageOptions, setLandingPageOptions] = useState([]);
  const [sendingProfileOptions, setSendingProfileOptions] = useState([]);
  const [groupOptions, setGroupOptions] = useState([]);

  const [userBelong, setUserBelong] = useState("");
  const [emailTemplate, setEmailTemplate] = useState("");
  const [landingPage, setLandingPage] = useState("");
  const [sendingProfile, setSendingProfile] = useState("");
  const [group, setGroup] = useState("");

  //Alert
  const [show, setShow] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("error");
  const [serverResponse, setServerResponse] = useState("");

  // require
  const [nameTouched, setNameTouched] = useState(false);
  const [endDateTouched, setEndDateTouched] = useState(false);
  const [landingTouched, setLandingTouched] = useState(false);
  const [SendingProfileTouched, setSendingProfileTouched] = useState(false);
  const [userBelongTouched, setUserBelongTouched] = useState(false);
  const [groupTouched, setGroupTouched] = useState(false);
  const [templateTouched, setTemplateTouched] = useState(false);

  const [formData, setFormData] = useState({
    cam_name: "",
    user_id: "",
    group_id: "",
    page_id: "",
    temp_id: "",
    smtp_id: "",
    completed_date: "",
  });
  const navigate = useNavigate();

  const showNameError = nameTouched && !formData.cam_name;
  const showEndDateError = endDateTouched && !formData.completed_date;
  const showLandingPageError = landingTouched && !formData.page_id;
  const showSendingProfileError = SendingProfileTouched && !formData.smtp_id;
  const showUserBelongError = userBelongTouched && !formData.user_id;
  const showGroupError = groupTouched && !formData.group_id;
  const showtemplateError = templateTouched && !formData.temp_id;

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // const axiosPrivate = useAxiosInterceptor();
  const access_token = localStorage.getItem("access_token") || "";

  useEffect(() => {
    getDataOfEach();
  }, []);

  const getDataOfEach = async () => {
    try {
      const response = await axios.get("campaign/alldata", {
        headers: {
          Authorization: `Bearer ${(access_token)}`,
        },
      });
      setUserBelongOptions(
        response.data.users.map((user) => ({
          value: user.id,
          label: user.email,
        }))
      );
      setEmailTemplateOptions(
        response.data.templates.map((template) => ({
          value: template.temp_id,
          label: template.temp_name,
        }))
      );
      setLandingPageOptions(
        response.data.pages.map((page) => ({
          value: page.page_id,
          label: page.path,
        }))
      );
      setSendingProfileOptions(
        response.data.smtps.map((smtp) => ({
          value: smtp.smtp_id,
          label: smtp.name,
        }))
      );
      setGroupOptions(
        response.data.groups.map((group) => ({
          value: group.id,
          label: group.groupname,
        }))
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setEndDate(null);

    setNameTouched(false);
    setEndDateTouched(false);
    setLandingTouched(false);
    setSendingProfileTouched(false);
    setUserBelongTouched(false);
    setGroupTouched(false);
    setTemplateTouched(false);
    setIsModalOpen(false);
  };

  //Create Campaign Page
  const handleLaunch = async (event) => {
    event.preventDefault();
    setLoading(true);
    if (
      !formData.cam_name ||
      !formData.user_id ||
      !formData.group_id ||
      !formData.page_id ||
      !formData.temp_id ||
      !formData.smtp_id ||
      !formData.completed_date
    ) {
      setNameTouched(true);
      setEndDateTouched(true);
      setLandingTouched(true);
      setSendingProfileTouched(true);
      setUserBelongTouched(true);
      setGroupTouched(true);
      setTemplateTouched(true);

      setAlertSeverity("error");
      setServerResponse("End date is required");
      setShow(true);
      return;
    }

    const completedDate = formData.completed_date;
    const currentDate = dayjs().format("YYYY-MM-DD");
    if (completedDate < currentDate) {
      setAlertSeverity("error");
      setServerResponse("Completion date cannot be earlier than today.");
      setShow(true);
      return;
    }

    try {
      const response = await axios.post("campaign/", formData, {
        headers: {
          Authorization: `Bearer ${(access_token)}`,
        },
      });

      setAlertSeverity("success");
      setServerResponse(response.data.msg);
      setShow(true);

      setFormData({
        cam_name: "",
        user_id: "",
        group_id: "",
        page_id: "",
        temp_id: "",
        smtp_id: "",
        completed_date: "",
      });
      setEndDate(null);

      setNameTouched(false);
      setEndDateTouched(false);
      setLandingTouched(false);
      setSendingProfileTouched(false);
      setUserBelongTouched(false);
      setGroupTouched(false);
      setTemplateTouched(false);

      setTimeout(() => {
        setShow(false);
        setIsModalOpen(false);
      }, 1500);
    } catch (error) {
      setAlertSeverity("error");
      setServerResponse(error.response.data.msg);
      console.log(serverResponse);
      setShow(true);
    }finally {
      setLoading(false);
    };
  };

  const handleRefresh = () => {
    setRefreshing(true);
    navigate(`/refresh`);
    setTimeout(() => {
      navigate(`/campaigns`);
      setRefreshing(false);
    });
  };

  return (
    <DashboardLayout>
      <>
        <Card
          title={
            <Typography.Title level={1}>
              Campaigns
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
              New Campaign
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
          title="New Campaign"
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
              icon={<RocketLaunchIcon
                style={{ width: "14px", height: "14px" }}
              />}
              style={{
                backgroundColor: "rgba(67,190,126,255)",
                color: "#FFF",
                fontSize: "13px",
                height: "36px",
              }}
              onClick={handleLaunch}
              loading={loading}

            >
              LAUNCH
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
            autoComplete="off"
          >
            <div>
              <TextField
                error={showNameError}
                helperText={showNameError ? "Campaign Name is required" : ""}
                label="Name"
                variant="outlined"
                name="cam_name"
                value={formData.cam_name || ""}
                onChange={handleFormChange}
                onBlur={() => setNameTouched(true)}
              />
              <TextField
                error={showUserBelongError}
                helperText={
                  showUserBelongError ? "User Belong is required" : ""
                }
                select
                label="User Belong To"
                variant="outlined"
                name="user_id"
                value={formData.user_id || ""}
                onChange={handleFormChange}
                onBlur={() => setUserBelongTouched(true)}
              >
                {userBelongOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                error={showtemplateError}
                helperText={
                  showtemplateError ? "Email Template is required" : ""
                }
                label="Email Template"
                variant="outlined"
                name="temp_id"
                value={formData.temp_id || ""}
                onChange={handleFormChange}
                onBlur={() => setTemplateTouched(true)}
              >
                {emailTemplateOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                error={showLandingPageError}
                helperText={
                  showLandingPageError ? "Landing Page is required" : ""
                }
                label="Landing Page"
                variant="outlined"
                name="page_id"
                value={formData.page_id || ""}
                onChange={handleFormChange}
                onBlur={() => setLandingTouched(true)}
              >
                {landingPageOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(date) => {
                    setEndDate(date);
                    setFormData((prevData) => ({
                      ...prevData,
                      completed_date: date ? date.format("YYYY-MM-DD") : "",
                    }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={showEndDateError}
                      helperText={
                        showEndDateError ? "End Date is required" : ""
                      }
                      onBlur={() => setEndDateTouched(true)}
                    />
                  )}
                />
              </LocalizationProvider>
              <TextField
                select
                error={showSendingProfileError}
                helperText={
                  showSendingProfileError ? "Sending Profile is required" : ""
                }
                label="Sending Profile"
                variant="outlined"
                name="smtp_id"
                value={formData.smtp_id}
                onChange={handleFormChange}
                onBlur={() => setSendingProfileTouched(true)}
              >
                {sendingProfileOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                error={showGroupError}
                helperText={showGroupError ? "Group Target is required" : ""}
                select
                label="Groups"
                variant="outlined"
                name="group_id"
                value={formData.group_id || ""}
                onChange={handleFormChange}
                onBlur={() => setGroupTouched(true)}
              >
                {groupOptions.map((option) => (
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