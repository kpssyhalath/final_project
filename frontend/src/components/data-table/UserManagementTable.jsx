import React, { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";

import {
  TextField,
  MenuItem,
  Box,
  IconButton,
  Alert,
  AlertTitle,
  Collapse,
} from "@mui/material";

import PropTypes from "prop-types";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import { Button, Modal, Divider } from "antd";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { visuallyHidden } from "@mui/utils"
import LinearProgress from "@mui/material/LinearProgress";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";

import axios from "@/middleware/axios";

function createData(id, name, role, last_modified_date, user_id) {
  return {
    id,
    name,
    role,
    last_modified_date,
    user_id,
  };
}

function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }
  
  function getComparator(order, orderBy) {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }
  
  function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) {
        return order;
      }
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }
  
  const headCells = [
    {
      id: "name",
      numeric: false,
      disablePadding: true,
      label: "Email",
      sortable: false,
    },
    {
      id: "role",
      numeric: true,
      disablePadding: false,
      label: "Role",
      sortable: true,
    },
    {
      id: "last_modified_date",
      numeric: true,
      disablePadding: false,
      label: "Last Modified Date",
      sortable: true,
    },
    {
      id: "actions",
      numeric: true,
      disablePadding: false,
      label: "",
      sortable: false,
    },
  ];
  
  function EnhancedTableHead(props) {
    const { order, orderBy, onRequestSort } = props;
    const createSortHandler = (property) => (event) => {
      onRequestSort(event, property);
    };
  
    return (
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox"></TableCell>
          {headCells.map((headCell) => (
            <TableCell
              key={headCell.id}
              align={headCell.numeric ? "right" : "left"}
              padding={headCell.disablePadding ? "none" : "normal"}
              sortDirection={orderBy === headCell.id ? order : false}
            >
              {headCell.sortable ? (
                <TableSortLabel
                  active={orderBy === headCell.id}
                  direction={orderBy === headCell.id ? order : "asc"}
                  onClick={createSortHandler(headCell.id)}
                >
                  {headCell.label}
                  {orderBy === headCell.id ? (
                    <Box component="span" sx={visuallyHidden}>
                      {order === "desc"
                        ? "sorted descending"
                        : "sorted ascending"}
                    </Box>
                  ) : null}
                </TableSortLabel>
              ) : (
                <Typography variant="subtitle2">{headCell.label}</Typography>
              )}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    );
  }
  
  EnhancedTableHead.propTypes = {
    onRequestSort: PropTypes.func.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    order: PropTypes.oneOf(["asc", "desc"]).isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
  };
  
  function EnhancedTableToolbar({ rowsPerPage, onRowsPerPageChange, onSearch }) {
    const [searchTerm, setSearchTerm] = useState("");
  
    const handleRowsPerPageChange = (event) => {
      let value = parseInt(event.target.value, 10);
      value = value > 0 ? value : 1;
      onRowsPerPageChange(value);
    };
  
    const handleSearchChange = (event) => {
      const { value } = event.target;
      setSearchTerm(value);
      onSearch(value);
    };
  
    return (
      <Toolbar
        sx={{
          pl: { sm: 2 },
          pr: { xs: 1, sm: 2 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          sx={{
            fontSize: "15px",
            marginRight: "8px",
          }}
          id="tableTitle"
          component="div"
        >
          Show
        </Typography>
        <TextField
          type="number"
          size="small"
          style={{ width: 70 }}
          value={rowsPerPage}
          onChange={handleRowsPerPageChange}
        />
        <Typography
          sx={{
            fontSize: "15px",
            marginLeft: "5px",
          }}
          id="tableTitle"
          component="div"
        >
          Columns
        </Typography>
        <div
          style={{ display: "flex", alignItems: "center", marginLeft: "auto" }}
        >
          <Typography
            sx={{
              fontSize: "15px",
              marginRight: "5px",
            }}
            id="tableTitle"
            component="div"
          >
            Search:
          </Typography>
  
          <TextField
            size="small"
            style={{}}
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              endAdornment: (
                <SearchIcon style={{ marginRight: "8px", color: "gray" }} />
              ),
            }}
          />
        </div>
      </Toolbar>
    );
  }
    
  export default function EnhancedTable() {
    const [order, setOrder] = React.useState("asc");
    const [orderBy, setOrderBy] = React.useState("role");
    const [selected, setSelected] = React.useState([]);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(6);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setisModalOpen] = useState(false);
    const [setModalOpen, setModalOpen_Delete] = useState(false);
  
    const [show, setShow] = useState(false); //Alerts
    const [alertSeverity, setAlertSeverity] = useState("error");
    const [serverResponse, setServerResponse] = useState("");
  
    const [emailTouched, setEmailTouched] = useState(false);
    const [passwordTouched, setPasswordTouched] = useState(false);
    const [confirm_passwordTouched, setConfirmPasswordTouched] = useState(false);
    const [roleTouched, setRoleTouched] = useState(false);
  
    const showEmailError = emailTouched && !email;
    const showPasswordError = passwordTouched && !password;
  
    const [rows, setUsersData] = useState([]);
  
    const [selectedID, setSelectedID] = useState(null);
    const [formData, setFormData] = useState({
      email: "",
      password: "",
      confirm_password: "",
    });
  
    useEffect(() => {
      getData();
    }, []);
  
    const access_token = localStorage.getItem("access_token") || " ";
  
    const getData = async () => {
      try {
        const response = await axios.get("user/", {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });
  
        const data = response.data;
        const formattedData = data.user.map((user, index) =>
          createData(
            index + 1,
            user.email,
            user.role,
            user.modifile_date || "N/A",
            user.user_id
          )
        );
        console.log(formattedData)
        setUsersData(formattedData);
      } catch (error) {
        console.log(error);
      }
    };
  
    // -------------------------------------------------------------------------------
    const handleRequestSort = (event, property) => {
      const isAsc = orderBy === property && order === "asc";
      setOrder(isAsc ? "desc" : "asc");
      setOrderBy(property);
    };
  
    const handleSelectAllClick = (event) => {
      if (event.target.checked) {
        const newSelected = rows.map((n) => n.id);
        setSelected(newSelected);
        return;
      }
      setSelected([]);
    };
  
    const handleClick = (event, id) => {
      const selectedIndex = selected.indexOf(id);
      let newSelected = [];
  
      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selected, id);
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selected.slice(1));
      } else if (selectedIndex === selected.length - 1) {
        newSelected = newSelected.concat(selected.slice(0, -1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(
          selected.slice(0, selectedIndex),
          selected.slice(selectedIndex + 1)
        );
      }
      setSelected(newSelected);
    };
  
    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };
    const handleRowsPerPageChange = (newRowsPerPage) => {
      setRowsPerPage(newRowsPerPage);
      setPage(0);
    };
  
    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };
  
    const isSelected = (id) => selected.indexOf(id) !== -1;
  
    const filteredRows = rows.filter((row) => {
      return row.name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  
    const visibleRows = stableSort(
      filteredRows,
      getComparator(order, orderBy)
    ).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    // ----------------------------------------------------------------
  
    
    // EDIT
    const showModal = () => {
      setisModalOpen(true);
    };
  
    const handleCancel = () => {
      setisModalOpen(false);
    };
  
    const editAction = (row) => {
      setSelectedID(row.user_id);
      setFormData({
        email: row.name,
        password: "",
        confirm_password: "",
      });
      showModal();
    };
  
    const handleEdit = async () => {
      try {
        const response = await axios.put(
          `user/management/${selectedID}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        );
  
        if (response) {
          setAlertSeverity("success");
          setServerResponse(response.data.msg);
          setShow(true)
          setFormData({
            email: "",
            password: "",
            confirm_password: "",
          });
  
          setTimeout(() => {
            setShow(false);
            setisModalOpen(false);
          }, 1500);
  
          getData();
        }
      } catch (error) {
        setAlertSeverity("error");
        setServerResponse(error.response.data.msg);
        console.log(serverResponse);
        setShow(true)
      }
    };
  
  
  
  
    // DELETE
    const showModal_Delete = (user_id) => {
      setSelectedID(user_id);
      setModalOpen_Delete(true);
    };
    const Cancel = () => {
      setModalOpen_Delete(false);
    };
  
    const handleDelete = async () => {
      try {
        const response = await axios.delete(`user/management/${selectedID}`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });
  
        if (response) {
          console.log("Delete successful!");
  
          setModalOpen_Delete(false);
          getData();
        }
      } catch (error) {
        console.error("error", error);
      }
    };
  
    return (
      <Box sx={{ width: "100%" }}>
        <Paper sx={{ width: "100%", mb: 2 }}>
          <EnhancedTableToolbar
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            onSearch={setSearchTerm}
          />
          <TableContainer>
            <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
              <EnhancedTableHead
                order={order}
                orderBy={orderBy}
                onSelectAllClick={handleSelectAllClick}
                onRequestSort={handleRequestSort}
                rowCount={rows.length}
              />
              <TableBody>
                {visibleRows.map((row, index) => {
                  const isItemSelected = isSelected(row.id);
                  const labelId = `enhanced-table-checkbox-${index}`;
  
                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id}
                      selected={isItemSelected}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell padding="checkbox"></TableCell>
  
                      {/* DATA HERE*/}
                      <TableCell
                        component="th"
                        id={labelId}
                        scope="row"
                        padding="none"
                      >
                        {row.name}
                      </TableCell>
  
                      <TableCell align="right">{row.role}</TableCell>
  
                      <TableCell align="right">
                        {row.last_modified_date}
                      </TableCell>
  
                      <TableCell align="right">
                        {row.name && (
                          <>
                            <Button
                              icon={<EditIcon />}
                              onClick={() => editAction(row)}
                              style={{
                                fontSize: "16px",
                                width: 70,
                                height: 40,
                                backgroundColor: "#43bf7d",
                                color: "#FFF",
                              }}
                            />
                            <Button
                              icon={<DeleteRoundedIcon />}
                              onClick={() => showModal_Delete(row.user_id)}
                              style={{
                                fontSize: "16px",
                                width: 70,
                                height: 40,
                                backgroundColor: "#e35e5e",
                                color: "#FFF",
                              }}
                            />
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={20} style={{ position: "relative" }}>
                      <LinearProgress
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                        }}
                      />
                      <Typography
                        align="center"
                        sx={{
                          fontSize: "14px",
                          color: "#c9c9c9",
                        }}
                      >
                        This might take a while to complete
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
  
          {/* Modal HERE */}
          <TablePagination
            rowsPerPageOptions={[]}
            sx={{
              "& .MuiTablePagination-displayedRows": { display: "none" },
            }}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
          <Modal
            title="Account Settings"
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
            style={{ width: "600px", height: "400px" }}
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
                  onClick={handleEdit}
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
                "& .MuiTextField-root": { m: 1, width: "100%" },
              }}
              noValidate
              autoComplete="off"
            >
              <div>
                <TextField
                  label="Email"
                  variant="outlined"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                {/* <TextField
                  label="Old Password"
                  variant="outlined"
                  type="password"
                  autoComplete="current-password"
                /> */}
                <TextField
                  label="New Password"
                  variant="outlined"
                  type="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <TextField
                  label="Confirm Password"
                  variant="outlined"
                  type="password"
                  autoComplete="current-password"
                  value={formData.confirm_password}
                  onChange={(e) =>
                    setFormData({ ...formData, confirm_password: e.target.value })
                  }
                />
              </div>
            </Box>
          </Modal>
          <Modal
            title="Delete Item"
            centered
            open={setModalOpen}
            onCancel={Cancel}
            cancelButtonProps={{
              style: {
                backgroundColor: "#ff5252",
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
                  onClick={handleDelete}
                  style={{
                    borderColor: "rgba(67,190,126,255)",
                    color: "rgba(67,190,126,255)",
                    fontSize: "13px",
                    height: "36px",
                  }}
                >
                  OK
                </Button>
              </>
            )}
          >
            <Typography>Are you sure you want to delete this item?</Typography>
          </Modal>
        </Paper>
      </Box>
    );
  }