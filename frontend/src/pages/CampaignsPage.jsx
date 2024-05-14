import DashboardLayout from "@/layouts/DashboardLayout";
import React, { useState } from "react";
import { Divider, Button, Modal, Card, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import Box from "@mui/material/Box";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import EnhancedTable from "@/components/data-table/CampaignsTable";

export default function CampaignsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [endDate, setEndDate] = useState(null);

  const [emailTemplate, setEmailTemplate] = useState("");
  const [landingPage, setLandingPage] = useState("");
  const [sendingProfile, setSendingProfile] = useState("");
  const [groupT, setGroup] = useState("");

  const [emailTemplateTouched, setEmailTemplateTouched] = useState(false);
  const [landingPageTouched, setLandingPageTouched] = useState(false);
  const [sendingProfileTouched, setSendingProfileTouched] = useState(false);
  const [groupTouched, setGroupTouched] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };


  const showNameError = nameTouched && name.length === 0;
  const showEmailTemplateError = emailTemplateTouched && !emailTemplate;
  const showLandingPageError = landingPageTouched && !landingPage;
  const showSendingProfileError = sendingProfileTouched && !sendingProfile;
  const showGroupError = groupTouched && !groupT;

  const userbelongOptions = [];
  const emailOptions = [];
  const landingOptions = [];
  const sendingOptions = [];
  const groupOptions = [];

  return (
    <DashboardLayout>
      <>
        <Card
          title={<Typography.Title level={1}>
            Campaigns
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
              width: 170,
              height: 40,
              backgroundColor: "rgb(104,188,131)",
              color: "#FFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bottom: "25px"
            }}
            onClick={showModal}
          >New Campaign</Button>
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
              height: "36px"
            }
          }}
          cancelText="CANCEL"

          footer={(_, { CancelBtn }) => (
            <>
              <CancelBtn

              />
              <Button
                icon={<RocketLaunchIcon style={{ width: "14px", height: "14px" }} />}
                style={{
                  backgroundColor: "rgba(67,190,126,255)",
                  color: "#FFF",
                  fontSize: "13px",
                  height: "36px"
                }}
              >LAUNCH</Button>
            </>
          )}
        >
          <Divider style={{ borderTopColor: "#d5d5d5" }} />
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
                error={showNameError}
                helperText={showNameError ? "Name is required" : ""}
                label="Name"
                variant="outlined"
                onBlur={() => setNameTouched(true)}
                onChange={(e) => setName(e.target.value)}

              />
              <TextField
                select
                label="User belong to"
                variant="outlined"
                onChange={(e) => setValue(e.target.value)}
              >
                {userbelongOptions.length > 0 ? (
                  userbelongOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No data available</MenuItem>
                )}
              </TextField>
              <TextField
                select
                error={showEmailTemplateError}
                helperText={showEmailTemplateError ? "Options is Required" : ""}
                label="Email Template"
                variant="outlined"
                onBlur={() => setEmailTemplateTouched(true)}
                onChange={(e) => setValue(e.target.value)}
              >
                {emailOptions.length > 0 ? (
                  emailOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No data available</MenuItem>
                )}
              </TextField>
              <TextField
                select
                error={showLandingPageError}
                helperText={showLandingPageError ? "Options is Required" : ""}
                label="Landing Page"
                variant="outlined"
                onBlur={() => setLandingPageTouched(true)}
                onChange={(e) => setValue(e.target.value)}
              >
                {landingOptions.length > 0 ? (
                  landingOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No data available</MenuItem>
                )}
              </TextField>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box
                  sx={{
                    width: "96%",
                  }}
                >
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    error={showNameError}
                    renderInput={(params) => (
                      <Box {...params} sx={{ color: showNameError ? "red" : "inherit" }} />
                    )}
                    renderDay={(day, _value, DayComponentProps) => (
                      <Box {...DayComponentProps} sx={{ color: showNameError ? "red" : "inherit" }} />
                    )}
                    inputFormat="MM/DD/YYYY"
                    fullWidth
                  />
                </Box>
              </LocalizationProvider>
              <TextField
                select
                error={showSendingProfileError}
                helperText={showSendingProfileError ? "Options is Required" : ""}
                label="Sending Profile"
                variant="outlined"
                onBlur={() => setSendingProfileTouched(true)}
                onChange={(e) => setValue(e.target.value)}
              >
                {sendingOptions.length > 0 ? (
                  sendingOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No data available</MenuItem>
                )}
              </TextField>
              <TextField
                select
                error={showGroupError}
                helperText={showGroupError ? "Options is Required" : ""}
                label="Groups"
                variant="outlined"
                onBlur={() => setGroupTouched(true)}
                onChange={(e) => setValue(e.target.value)}
              >
                {groupOptions.length > 0 ? (
                  groupOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No data available</MenuItem>
                )}
              </TextField>


            </div>
          </Box>


        </Modal>

      </>
    </DashboardLayout>
  );
}
