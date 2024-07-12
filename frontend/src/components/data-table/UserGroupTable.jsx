import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Typography,
  Paper,
  LinearProgress,
  TextField,
  Collapse,
  IconButton,
  Alert,
  AlertTitle,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { Button, Modal, Divider, Upload } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CloseIcon from "@mui/icons-material/Close";

import EnhancedTable_m from "@/components/data-table/EUserGroupPopupTable";
import axios from "@/middleware/axios";


function createData(id, name, member, modified_date, target_list, group_id) {
  return {
    id,
    name,
    member,
    modified_date,
    target_list,
    group_id,
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
    label: "Name",
    sortable: false,
  },
  {
    id: "member",
    numeric: true,
    disablePadding: false,
    label: "# of member",
    sortable: true,
  },
  {
    id: "modified_date",
    numeric: true,
    disablePadding: false,
    label: "Last Modified Date",
    sortable: true,
  },
  {
    id: "actions",
    numeric: false,
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
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("member");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [setModalOpen, setModalOpen_Delete] = useState(false);

  const [name, setName] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [target, setTarget] = useState([]);

  const [rows, setUsersData] = useState([]);
  const [selectedID, setSelectedID] = useState(null);

  //Alert
  const [show, setShow] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("error");
  const [serverResponse, setServerResponse] = useState("");

  const handleDelete = (id) => {
    setTarget((prevTargets) =>
      prevTargets.filter((target) => target.id !== id)
    );
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setFirstname("");
    setLastname("");
    setEmail("");
    setTarget([]);
    setIsModalOpen(false);
  };

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

  // const axiosPrivate = useAxiosInterceptor();
  const access_token = localStorage.getItem("access_token") || " ";

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const response = await axios.get("group/", {
        headers: {
          Authorization: `Bearer ${(access_token)}`,
        },
      });
      const data = response.data;
      const formattedData = data.group_target.map((group_target, index) =>
        createData(
          index + 1,
          group_target.group_name,
          group_target.target_amount,
          group_target.modified_date || "N/A",
          group_target.target_list,
          group_target.group_id
        )
      );
      setUsersData(formattedData);
    } catch (error) {
      console.error("Error fetching email template data:", error);
    }
  };

  const editAction = (row) => {
    setSelectedID(row.group_id);
    setName(row.name);
    row.target_list.forEach((target) => {
      const newTarget = {
        id: target.id,
        first_name: target.firstname,
        last_name: target.lastname,
        email: target.email,
        actions: {
          deleteAction: () => {
            handleDelete(target.id);
            console.log(`Deleting item with ID ${target.id}`);
          },
        },
      };

      setTarget((prevUsers) => [...prevUsers, newTarget]);
    });


    showModal();
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEditTarget = () => {
    const trimmedFirstname = firstname.trim();
    const trimmedEmail = email.trim();

    if (!trimmedFirstname) {
      setAlertSeverity("error");
      setServerResponse("Firstname is required");
      setShow(true);

      return;
    }

    if (!trimmedEmail) {
      setAlertSeverity("error");
      setServerResponse("Email is required");
      setShow(true);

      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setAlertSeverity("error");
      setServerResponse("Invalid email address");
      setShow(true);
      return;
    }

    const newTargetAdd = {
      id: target.length + 1,
      first_name: firstname,
      last_name: lastname,
      email: email,
      actions: {
        deleteAction: () => {
          handleDelete(target.length + 1);
          console.log(`Deleting item with ID ${target.length + 1}`);
        },
      },
    };

    setTarget((prevUsers) => [...prevUsers, newTargetAdd]);
    setFirstname("");
    setLastname("");
    setEmail("");
    setShow(false);
  };

  const handleSave = () => {
    if (!name.trim()) {
      setAlertSeverity("error");
      setServerResponse("Group name is required");
      setShow(true);
      return;
    }

    if (target.length === 0) {
      setAlertSeverity("error");
      setServerResponse("At least one target is required in the group target");
      setShow(true);
      return;
    }

    const formattedData = {
      group_name: name,
      target_list: target,
    };

    setShow(false);
    Edit_Group_Target(formattedData);
  };

  //Edit Group Target Profile
  const Edit_Group_Target = async (formData) => {
    console.log(formData);

    try {
      const response = await axios.put(`group/${selectedID}`, formData, {
        headers: {
          Authorization: `Bearer ${(access_token)}`,
        },
      });

      if (response) {
        setAlertSeverity("success");
        setServerResponse(response.data.msg);
        setShow(true);

        setName("");
        setFirstname("");
        setLastname("");
        setEmail("");
        setTarget([]);
      }
      getData();
      setTimeout(() => {
        setShow(false);
        setIsModalOpen(false);
      }, 1500);
    } catch (error) {
      setAlertSeverity("error");
      setServerResponse(error.response.data.msg);
      console.log(serverResponse);
      setShow(true);
      console.log(error);
    }
  };

  // DELETE
  const showModal_Delete = (group_id) => {
    setSelectedID(group_id);
    setModalOpen_Delete(true);
  };
  const Cancel = () => {
    setShow(false);
    setModalOpen_Delete(false);
  };

  const handleDeleteGroup = async () => {
    try {
      const response = await axios.delete(`group/${selectedID}`, {
        headers: {
          Authorization: `Bearer ${(access_token)}`,
        },
      });
      if (response) {
        console.log("Delete successful!");

        getData();
        setModalOpen_Delete(false);
      }
    } catch (error) {
      setAlertSeverity("error");
      setServerResponse("This Group is working, can not be deleted");
      setShow(true);
    }
    console.log(selectedID);
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
                const labelId = `enhanced-table-checkb ox-${index}`;

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
                    <TableCell
                      component="th"
                      id={labelId}
                      scope="row"
                      padding="none"
                    >
                      {row.name}
                    </TableCell>
                    <TableCell align="right">{row.member}</TableCell>
                    <TableCell align="right">{row.modified_date}</TableCell>
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
                            onClick={() => showModal_Delete(row.group_id)}
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
          title="Edit Group"
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
                onClick={handleSave}
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
              value={name || ""}
              onChange={(e) => setName(e.target.value)}
            />
            <div style={{ display: "flex", gap: 2 }}>
              <TextField
                label="Firstname"
                variant="outlined"
                sx={{ flex: 1 }}
                value={firstname || ""}
                onChange={(e) => setFirstname(e.target.value)}
              />
              <TextField
                label="Lastname"
                variant="outlined"
                sx={{ flex: 1 }}
                value={lastname || ""}
                onChange={(e) => setLastname(e.target.value)}
              />
              <TextField
                label="Email"
                variant="outlined"
                sx={{ flex: 1 }}
                value={email || ""}
                onChange={(e) => setEmail(e.target.value)}
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
                onClick={handleEditTarget}
              >
                Add Item
              </Button>
            </div>
            <div style={{ marginTop: "10px" }}>
              <EnhancedTable_m data={target || []} />
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
                onClick={handleDeleteGroup}
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
          <Typography>Are you sure you want to delete this item?</Typography>
        </Modal>
      </Paper>
    </Box>
  );
}