import * as React from 'react';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
// @mui
import Swal from 'sweetalert2';
import {
    Card, Table, Grid, Button, Container, Stack, Typography, TextField, Input, Popover, MenuItem, TableContainer,
    TablePagination, TableRow, TableCell, TableBody, Paper
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Label from '../components/label';
import ModalDetail from '../components/modalDetail/ModalDetail';
import ModalDetailUser from '../components/modalDetailUser/ModalDetailUser';
import { prod, dev } from "../utils/env";

// components
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';

const TABLE_HEAD = [
    { id: 'exness', label: 'Exness ID', alignRight: false },
    { id: 'status', label: 'Status', alignRight: false },
    { id: 'action', label: 'Action', alignRight: false },
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
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    if (query) {
        return filter(array, (_user) => _user.exnessId.toString().indexOf(query.toString()) !== -1);
    }
    return stabilizedThis.map((el) => el[0]);
}

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

const StyledContent = styled('div')(({ theme }) => ({
    margin: 'auto',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    gap: '50px'
}));

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

const StyledProductImg = styled('img')({
    top: 0,
    width: '40%',
    height: '40%',
    objectFit: 'cover',
    margin: 'auto',
});

// ----------------------------------------------------------------------

export default function InputFileUpload() {
    const navigate = useNavigate();
    const [fileSelected, setFileSelected] = useState(null);
    const [isSelected, setIsSelected] = useState(true);
    const [currentEmail] = useState(localStorage.getItem("email") ? localStorage.getItem("email") : "");
    const [url, setUrl] = useState("");
    const [exness, setExness] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [currentAccessToken] = useState(localStorage.getItem("access_token") ? localStorage.getItem("access_token") : "");
    const [listExness, setListExness] = useState([]);
    const [listExnessInfo, setListExnessInfo] = useState([]);
    const [currentExness, setCurrentExness] = useState("");
    const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
    const [open2, setOpen2] = useState(null);
    const [page, setPage] = useState(0);

    const [order, setOrder] = useState('asc');

    const [selected, setSelected] = useState([]);

    const [orderBy, setOrderBy] = useState('name');

    const [filterName, setFilterName] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const handleOpen2 = (event) => {
        setOpen2(event.currentTarget);
    };

    const handleClose2 = () => {
        setOpen2(null);
    };

    const handleChangeExness = (exness) => {
        setCurrentExness(exness);

        handleClose2();
    }

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelecteds = listExness.map((n) => n.exness);
            setSelected(newSelecteds);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event, name) => {
        const selectedIndex = selected.indexOf(name);
        let newSelected = [];
        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, name);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
        }
        setSelected(newSelected);
    };

    const openModalDetail = (id) => {
        setIsModalDetailOpen(true);
        setCurrentExness(id);
    };

    const closeModalDetail = () => {
        setIsModalDetailOpen(false);
    };

    useEffect(() => {
        let endpoint = "";
        endpoint = `${prod}/api/v1/secured/get-all-exness/${currentEmail}`;
        const config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: endpoint,
            headers: {
                'Authorization': `Bearer ${currentAccessToken}`
            }
        };

        axios.request(config)
            .then((response) => {
                setListExnessInfo(response.data);
                setListExness(response.data);
                setCurrentExness(response.data[0].exnessId);
            })
            .catch((error) => {
                if (error.response.status === 403) {
                    Swal.fire({
                        title: "An error occured",
                        icon: "error",
                        timer: 3000,
                        position: 'center',
                        showConfirmButton: false
                    });
                } else {
                    Swal.fire({
                        title: "Session is ended, please login again !",
                        icon: "error",
                        timer: 3000,
                        position: 'center',
                        showConfirmButton: false
                    }).then(() => {
                        localStorage.clear();
                        navigate('/login', { replace: true });
                    });
                }
            });
    }, []);

    const handleFileSelect = (e) => {
        setFileSelected(e.target.files[0]);
        setIsSelected(!isSelected);
        if (e.target.files[0]) {
            setUrl(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleUpload = () => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append("file", fileSelected);
        formData.append("exness", currentExness);

        const config = {
            method: "post",
            maxBodyLength: Infinity,
            url: `${prod}/api/v1/secured/upload-transaction`,
            headers: {
                Authorization: `Bearer ${currentAccessToken}`
            },
            data: formData
        };

        axios.request(config)
            .then(response => {
                if (response.data.includes("cập nhật ảnh chuyển tiền thành công!")) {
                    Swal.fire({
                        title: response.data,
                        icon: "success",
                        timer: 3000,
                        position: 'center',
                        showConfirmButton: false
                    }).then(() => {
                        window.location.reload();
                    });
                } else {
                    Swal.fire({
                        title: response.data,
                        icon: "error",
                        timer: 3000,
                        position: 'center',
                        showConfirmButton: false
                    })
                }
            })
            .catch((error) => {
                // Swal.fire({
                //     title: "Please remove protected mode and try again!",
                //     icon: "error",
                //     timer: 3000,
                //     position: 'center',
                //     showConfirmButton: false
                // })
                console.log(error);
            });

        setIsLoading(false);
    }

    const handleRemove = () => {
        setFileSelected(null);
        setIsSelected(!isSelected);
        setUrl("");
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setPage(0);
        setRowsPerPage(parseInt(event.target.value, 10));
    };

    const handleFilterByName = (event) => {
        setPage(0);
        setFilterName(event.target.value);
    };

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - listExness.length) : 0;

    const filteredUsers = applySortFilter(listExness, getComparator(order, orderBy), filterName);

    const isNotFound = !filteredUsers.length && !!filterName;
    return (
        <>
            <Helmet>
                <title> Upload </title>
                <link rel='icon' type='image/x-icon' href='/assets/logo.svg' />
            </Helmet>

            <Container>
                <StyledContent>
                    <Stack spacing={3}>
                        <Grid item xs={12} sm={12} md={12}>
                            {url ? <StyledProductImg alt={"img"} src={url} /> : <StyledProductImg alt={"img"} src={"/assets/default-upload.png"} />}

                        </Grid>
                        <Grid container>
                            <Grid item xs={12} sm={12} md={12} >
                                <Input className="form-field " onClick={handleOpen2} type="text" value={currentExness} style={{ minWidth: "200px", marginBottom: "15px", paddingLeft: "10px", cursor: "pointer!important", }} />
                                <Popover
                                    open={Boolean(open2)}
                                    anchorEl={open2}
                                    onClose={handleClose2}
                                    anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                                    transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                                    PaperProps={{
                                        sx: {
                                            p: 1,
                                            width: 240,
                                            marginTop: "40px",
                                            '& .MuiMenuItem-root': {
                                                px: 1,
                                                typography: 'body2',
                                                borderRadius: 0.75,
                                            },
                                        },
                                    }}
                                >
                                    {listExness.map((item, index) => {
                                        return <MenuItem key={index} onClick={() => { handleChangeExness(item.exnessId) }}>
                                            <Iconify sx={{ mr: 2 }} />
                                            {item.exnessId}
                                        </MenuItem>
                                    })}
                                </Popover>
                            </Grid>
                            <Grid item xs={4} sm={4} md={4}>
                                <Button fullWidth component="label" disabled={isLoading} color={"warning"} startIcon={<CloudUploadIcon />}>
                                    Choose
                                    <VisuallyHiddenInput type="file" onChange={(e) => { handleFileSelect(e) }} />
                                </Button>
                            </Grid>
                            <Grid item xs={4} sm={4} md={4}>
                                <Button onClick={handleRemove} fullWidth disabled={isSelected || isLoading} component="label" color={"error"} startIcon={<CloudUploadIcon />}>
                                    Remove
                                </Button>
                            </Grid>
                            <Grid item xs={4} sm={4} md={4}>
                                <Button onClick={handleUpload} fullWidth disabled={isSelected || isLoading} component="label" color={"success"} startIcon={<CloudUploadIcon />}>
                                    Upload
                                </Button>
                            </Grid>
                        </Grid>
                    </Stack>
                    <Card>
                        <Scrollbar>
                            <TableContainer sx={{ minWidth: 800 }}>
                                <Table>
                                    <UserListHead
                                        order={order}
                                        orderBy={orderBy}
                                        headLabel={TABLE_HEAD}
                                        rowCount={listExness.length}
                                        numSelected={selected.length}
                                        onRequestSort={handleRequestSort}
                                        onSelectAllClick={handleSelectAllClick}
                                    />
                                    <TableBody>
                                        {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                                            const selectedUser = selected.indexOf(row) !== -1;
                                            const { exnessId, status, message } = row;

                                            return (
                                                <TableRow hover key={exnessId} tabIndex={-1} role="checkbox" selected={selectedUser}>
                                                    <TableCell component="th" scope="row" padding="none">
                                                        <Stack direction="row" alignItems="center" spacing={2}>
                                                            <Typography variant="subtitle2" noWrap>
                                                                {exnessId}
                                                            </Typography>
                                                        </Stack>
                                                    </TableCell>

                                                    <TableCell align="left">
                                                        <Label color={(status ? "success" : "error")}>{status ? "Active" : "Inactive"}</Label>
                                                    </TableCell>

                                                    <TableCell component="th" scope="row" padding="none">
                                                        <Stack direction="row" alignItems="center" spacing={2}>
                                                            {message ? <Label onClick={() => { openModalDetail(exnessId) }} style={{ cursor: "pointer" }} color={("info")}>{"Xem ảnh"}</Label> :
                                                                <Label style={{ cursor: "not-allowed" }} color={("error")}>{"Chưa upload"}</Label>}
                                                        </Stack>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                        {emptyRows > 0 && (
                                            <TableRow style={{ height: 53 * emptyRows }}>
                                                <TableCell colSpan={6} />
                                            </TableRow>
                                        )}
                                    </TableBody>
                                    <ModalDetailUser className="abc" isOpen={isModalDetailOpen} onClose={closeModalDetail} exness={currentExness} />
                                    {isNotFound && (
                                        <TableBody>
                                            <TableRow>
                                                <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                                                    <Paper
                                                        sx={{
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        <Typography variant="h6" paragraph>
                                                            Not found
                                                        </Typography>

                                                        <Typography variant="body2">
                                                            No results found for &nbsp;
                                                            <strong>&quot;{filterName}&quot;</strong>.
                                                            <br /> Try checking for typos or using complete words.
                                                        </Typography>
                                                    </Paper>
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    )}
                                </Table>
                            </TableContainer>
                        </Scrollbar>

                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={listExness.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </Card>
                </StyledContent>

            </Container>
        </>
    );
}
