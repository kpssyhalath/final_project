import React, { useState } from "react";
import { Typography, Card, Divider, Button, Modal } from "antd";
import { TextField, MenuItem, Box, IconButton, Alert, AlertTitle, Collapse } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';



import { PlusOutlined } from "@ant-design/icons";
import EnhancedTable from "@/components/data-table/UserManagementTable";
import DashboardLayout from "@/layouts/DashboardLayout";
import axios from "@/middleware/axios";

export default function UserManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Alert
  const [show, setShow] = useState(false); 
  const [alertSeverity, setAlertSeverity] = useState("error");
  const [serverResponse, setServerResponse] = useState("");

  // require
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirm_passwordTouched, setConfirmPasswordTouched] = useState(false);
  const [roleTouched, setRoleTouched] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirm_password: "",
    role: "",
  });
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // require
  const showEmailError = emailTouched && !formData.email;
  const showPasswordError = passwordTouched && !formData.password;
  const showConfirmPasswordError = confirm_passwordTouched &&!formData.confirm_password;
  const showRoleError = roleTouched &&!formData.role;
  

  const showModal = () => {
    setIsModalOpen(true);
  };
  
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  
  
  const roleOptions = [
    { value: 1, label: "Admin" },
    { value: 2, label: "User" },
  ];
  const access_token = localStorage.getItem("access_token");

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(
        "user/",
        formData,
        {
          headers: {
            'Authorization': `Bearer ${access_token}`,
          },
        }
      );
      
      setAlertSeverity("success");
      setServerResponse(response.data.msg);
      setShow(true)

      setFormData({
        email: "",
        password: "",
        confirm_password: "",
        role: "",
      });
      
      setEmailTouched(false);
      setPasswordTouched(false);
      setConfirmPasswordTouched(false);
      setRoleTouched(false);


      setTimeout(() => {
        setShow(false);
        setIsModalOpen(false);
      }, 1500);
      
      // location.reload();

    } catch (error) {
      setAlertSeverity("error");
      setServerResponse(error.response.data.msg);
      console.log(serverResponse);
      setShow(true)


      //redirect to login
      // navigate("/login", { state: { from: location }, replace: true });
    }
  };

  return (
    <DashboardLayout>
      <>
        <Card
          title={
            <Typography.Title level={1}>
              User Management
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
            New User
          </Button>
          <div style={{ marginTop: "10px" }}>
            <EnhancedTable />
          </div>
        </Card>
        <Modal
          title="New User"
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
                    <Box sx={{ width: '100%' }}>
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
                    <AlertTitle>{alertSeverity === "success" ? "Success" : "Error"}</AlertTitle>
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
                error={showEmailError}
                helperText={showEmailError? "Email is required" : ""}
                label="Email"
                name="email"
                variant="outlined"
                value={formData.email}
                onBlur={() => setEmailTouched(true)}
                onChange={handleInputChange}

              />
              <TextField
                error={showPasswordError}
                helperText={showPasswordError? "Password is required" : ""}
                label="Password"
                name="password"
                variant="outlined"
                type="password"
                autoComplete="current-password"
                value={formData.password}
                onBlur={() => setPasswordTouched(true)}
                onChange={handleInputChange}
              />
              <TextField
                error={showConfirmPasswordError}
                helperText={showConfirmPasswordError? "Confirm Password is required" : ""}
                label="Confirm Password"
                name="confirm_password"
                variant="outlined"
                type="password"
                autoComplete="current-password"
                onBlur={() => setConfirmPasswordTouched(true)}
                value={formData.confirm_password}
                onChange={handleInputChange}
              />
              <TextField
                error={showRoleError}
                helperText={showRoleError? "Role is required" : ""}
                select
                label="Role"
                name="role"
                variant="outlined"
                value={formData.role}
                onBlur={() => setRoleTouched(true)}
                onChange={handleInputChange}
              >
                {roleOptions.map((option) => (
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