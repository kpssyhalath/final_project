import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  TextField,
  MenuItem,
  Box,
  IconButton,
  Alert,
  AlertTitle,
  Collapse,
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
} from "@mui/material";
import { Button, Modal } from "antd";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { visuallyHidden } from "@mui/utils";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";

import axios from "@/middleware/axios";


function createData(id, name, launch_date, status, cam_id) {
  return {
    id,
    name,
    launch_date,
    status,
    cam_id,
  };
}

function getButtonForRow(row) {
  if (row.status === "Error") {
    return (
      <div
        style={{
          fontSize: "16px",
          width: 60,
          height: 40,
          backgroundColor: "#e35e5e",
          color: "#FFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "not-allowed",
          borderRadius: "4px",
          pointerEvents: "none",
          float: "right",
        }}
      >
        {row.status}
      </div>
    );
  } else if (row.status === "In Progress") {
    return (
      <div
        style={{
          fontSize: "16px",
          width: 100,
          height: 40,
          backgroundColor: "#2485df",
          color: "#FFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "not-allowed",
          borderRadius: "4px",
          pointerEvents: "none",
          textAlign: "right",
          float: "right",

        }}
      >
        {row.status}
      </div>
    );
  }else {
    return (
      <div
        style={{
          fontSize: "16px",
          width: 100,
          height: 40,
          backgroundColor: "#43bf7d",
          color: "#FFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "not-allowed",
          borderRadius: "4px",
          pointerEvents: "none",
          textAlign: "right",
          float: "right",

        }}
      >
        {row.status}
      </div>
    );
  }
  return null;
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
    id: "launch_date",
    numeric: true,
    disablePadding: false,
    label: "Launch Date",
    sortable: true,
  },
  {
    id: "status",
    numeric: true,
    disablePadding: false,
    label: "Status",
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
  const navigate = useNavigate();

  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("launch_date");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [setModalOpen, setModalOpen_Delete] = useState(false);

  const [rows, setUsersData] = useState([]);
  const [selectedID, setSelectedID] = useState(null);

//   const axiosPrivate = useAxiosInterceptor();
  const access_token = localStorage.getItem("access_token") || " ";

  //Get Data
  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const response = await axios.get("campaign/", {
        headers: {
          Authorization: `Bearer ${(access_token)}`,
        },
      });

      const data = response.data;
      const formattedData = data.campaign.map((campaign, index) =>
        createData(
          index + 1,
          campaign.cam_name,
          campaign.launch_date,
          campaign.status,
          campaign.cam_id
        )
      );
      setUsersData(formattedData);
    } catch (error) {
      console.log(error);
    }
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



  //View Result
  const handleViewResult = (cam_id) => {

    navigate(`/campaigns/result/${cam_id}`);
  };

  // DELETE
  const showModal_Delete = (cam_id) => {
    setSelectedID(cam_id);
    setModalOpen_Delete(true);
  };
  const Cancel = () => {
    setModalOpen_Delete(false);
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `campaign/${selectedID}`,
        {
          headers: {
            Authorization: `Bearer ${(access_token)}`,
          },
        }
      );

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
                    <TableCell
                      component="th"
                      id={labelId}
                      scope="row"
                      padding="none"
                    >
                      {row.name}
                    </TableCell>
                    <TableCell align="right" >{row.launch_date}</TableCell>
                    <TableCell align="right" >{getButtonForRow(row)}</TableCell>
                    <TableCell align="right">
                      {row.name && (
                        <>
                          <Button
                            icon={<GridViewRoundedIcon />}
                            onClick={() => handleViewResult(row.cam_id)}
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
                            onClick={() => showModal_Delete(row.cam_id)}
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