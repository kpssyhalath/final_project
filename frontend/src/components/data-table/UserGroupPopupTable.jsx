import React, { useState } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import { Button } from "antd";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { visuallyHidden } from "@mui/utils";
import LinearProgress from "@mui/material/LinearProgress";
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
function createData(id, first_name, last_name, email) {
    return {
        id,
        first_name,
        last_name,
        email,
        actions: {
            deleteAction: () => {
                console.log(`Delete button clicked for row ${id}`);
            },
            exportAction: () => {
                console.log(`Export button clicked for row ${id}`);
            }
        }
    };
};


const rows = [
    createData(1, "Cupcake", 305, "Error"),
    createData(2, "Donut", 452, "In Progress"),
    createData(3, "Eclair", 262, "In Progress"),
    createData(4, "Frozen yoghurt",232, "Error"),
    createData(5, "Gingerbread", 356, "In Progress"),
    createData(6, "Honeycomb", 408, "In Progress"),
    createData(7, "Ice cream sandwich",121, "In Progress"),
    createData(8, "Jelly Bean", 375, "In Progress"),
    createData(9, "KitKat", 518, "In Progress"),
    createData(10, "Lollipop", 392, "In Progress"),
    createData(11, "Marshmallow", 318, "In Progress"),
    createData(12, "Nougat", 360, "In Progress"),
    createData(13, "Oreo", 437, "In Progress"),
];

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
        id: "first_name",
        numeric: false,
        disablePadding: true,
        label: "Firstname",
        sortable: false,
    },
    {
        id: "last_name",
        numeric: false,
        disablePadding: false,
        label: "Lastname",
        sortable: true,
    },
    {
        id: "email",
        numeric: false,
        disablePadding: false,
        label: "Email",
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
    const { order, orderBy, onRequestSort } =
        props;
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
                                        {order === "desc" ? "sorted descending" : "sorted ascending"}
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
                pr: { xs: 1, sm: 1 },
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
            }}
        >

            <Typography
                sx={{
                    fontSize: "15px",
                    marginRight: "8px"
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
                    marginLeft: "5px"
                }}
                id="tableTitle"
                component="div"
            >
                Columns
            </Typography>
            <div style={{ display: "flex", alignItems: "center", marginLeft: "auto" }}>
                <Typography
                    sx={{
                        fontSize: "15px",
                        marginRight: "2px"
                    }}
                    id="tableTitle"
                    component="div"
                >
                    Search:
                </Typography>
                <TextField
                    size="small"
                    style={{ width: 290 }}
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
    const [orderBy, setOrderBy] = React.useState("last_name");
    const [selected, setSelected] = React.useState([]);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(1);
    const [searchTerm, setSearchTerm] = useState("");

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
                selected.slice(selectedIndex + 1),
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

    const filteredRows = rows.filter(row => {
        return (
            row.first_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });


    const visibleRows = stableSort(filteredRows, getComparator(order, orderBy)).slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage,
    );

    return (
        <Box sx={{ width: "100%" }}>
            <Paper sx={{ width: "100%", mb: 2 }}>
                <EnhancedTableToolbar
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    onSearch={setSearchTerm}
                />
                <TableContainer>
                    <Table
                        sx={{ minWidth: 750 }}
                        aria-labelledby="tableTitle"
                    >
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
                                        <TableCell padding="checkbox">

                                        </TableCell>
                                        <TableCell
                                            component="th"
                                            id={labelId}
                                            scope="row"
                                            padding="none"
                                        >
                                            {row.first_name}
                                        </TableCell>
                                        <TableCell
                                            align="left"
                                        >
                                            {row.last_name}
                                        </TableCell>
                                        <TableCell align="left">
                                            {row.email}
                                        </TableCell>
                                        <TableCell align="right">
                                            {row.first_name && (
                                                <>
                                                    <Button
                                                        icon={<EditIcon />}
                                                        onClick={row.actions.exportAction}
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
                                                        onClick={row.actions.deleteAction}
                                                        style={{
                                                            fontSize: "16px",
                                                            width: 70,
                                                            height: 40,
                                                            backgroundColor: "#e35e5e",
                                                            color: "#FFF",
                                                        }} />
                                                </>
                                            )}
                                        </TableCell>

                                    </TableRow>
                                );
                            })}
                            {rows.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={20} style={{ position: "relative" }}>
                                        <LinearProgress style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
                                        <Typography align="center" sx={{
                                            fontSize: "14px",
                                            color: "#c9c9c9",
                                        }}>
                                            Loading items...
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
                        "& .MuiTablePagination-displayedRows": { display: "none" }
                    }}
                    component="div"
                    count={rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>

        </Box>
    );
}