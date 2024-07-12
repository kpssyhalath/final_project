import React, { useState } from "react";
import { TextField, MenuItem, Box, IconButton, Alert, AlertTitle, Collapse } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { Typography, Card, Divider, Button, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import DashboardLayout from "@/layouts/DashboardLayout";
import EnhancedTable from "@/components/data-table/SendingProfilesTable";
import axios from "@/middleware/axios";


export default function SendingProfilesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Alert
  const [show, setShow] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("error");
  const [serverResponse, setServerResponse] = useState("");

  // require
  const [profileNameTouched, setProfileNameTouched] = useState(false);
  const [fromAddressTouched, setFromAddressTouched] = useState(false);
  const [hostTouched, setHostTouched] = useState(false);
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const [formData, setFormData] = useState({
    profile_name: "",
    from_address: "",
    host: "",
    username: "",
    password: "",
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // require
  const showProfileError = profileNameTouched && !formData.profile_name;
  const showFromAddressError = fromAddressTouched && !formData.from_address;
  const showHostError = hostTouched && !formData.host;
  const showUsernameError = usernameTouched && !formData.username;
  const showPasswordError = passwordTouched && !formData.password;

  // const axiosPrivate = useAxiosInterceptor();

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const access_token = localStorage.getItem("access_token");

  //Create Sending Profile
  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(
        "sending_profile/",
        formData,
        {
          headers: {
            'Authorization': `Bearer ${(access_token)}`,
          },
        }
      );

      setAlertSeverity("success");
      setServerResponse(response.data.msg);
      setShow(true)


      setFormData({
        profile_name: "",
        from_address: "",
        host: "",
        username: "",
        password: "",
      });

      setProfileNameTouched(false);
      setFromAddressTouched(false);
      setHostTouched(false);
      setUsernameTouched(false);
      setPasswordTouched(false);

      setTimeout(() => {
        setShow(false);
        setIsModalOpen(false);
      }, 1500);

    } catch (error) {
      setAlertSeverity("error");
      setServerResponse(error.response.data.msg);
      console.log(serverResponse);
      setShow(true)


    }
    console.log(formData);
  };

  return (
    <DashboardLayout>
      <>
        <Card
          title={
            <Typography.Title level={1}>
              Sending Profiles
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
            New Profile
          </Button>
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
            <div>
              <TextField
                error={showProfileError}
                helperText={showProfileError ? "Profile Name is required" : ""}
                label="Profile Name"
                name="profile_name"
                variant="outlined"
                value={formData.profile_name}
                onBlur={() => setProfileNameTouched(true)}
                onChange={handleInputChange}
              />
              <TextField
                disabled
                label="Interface Type"
                variant="outlined"
                defaultValue="SMTP"
              />
              <TextField
                error={showFromAddressError}
                helperText={
                  showFromAddressError ? "From Address is required" : ""
                }
                label="From"
                name="from_address"
                variant="outlined"
                placeholder="First Last <test@example.com>"
                value={formData.from_address}
                onBlur={() => setFromAddressTouched(true)}
                onChange={handleInputChange}
              />
              <TextField
                error={showHostError}
                helperText={showHostError ? "Host is required" : ""}
                label="Host"
                name="host"
                variant="outlined"
                placeholder="smtp.example.com:587"
                value={formData.host}
                onBlur={() => setHostTouched(true)}
                onChange={handleInputChange}
              />
              <TextField
                error={showUsernameError}
                helperText={showUsernameError ? "Username is required" : ""}
                label="Username"
                name="username"
                variant="outlined"
                value={formData.username}
                onBlur={() => setUsernameTouched(true)}
                onChange={handleInputChange}
              />
              <TextField
                error={showPasswordError}
                helperText={showPasswordError ? "Password is required" : ""}
                label="Password"
                name="password"
                variant="outlined"
                type="password"
                autoComplete="current-password"
                value={formData.password}
                onBlur={() => setPasswordTouched(true)}
                onChange={handleInputChange}
              />
            </div>
          </Box>
        </Modal>
      </>
    </DashboardLayout>
  );
}