import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
// @mui
import {
  Card,
  Table,
  Stack,
  Paper,
  Avatar,
  Button,
  Popover,
  Checkbox,
  TableRow,
  MenuItem,
  TableBody,
  TableCell,
  Container,
  Typography,
  IconButton,
  TableContainer,
  TablePagination,
} from '@mui/material';
// components

import ModalEdit from '../components/modalEdit/ModalEdit';
import ModalExness from '../components/modal/ModalExness';
import ModalDetail from '../components/modalDetail/ModalDetail';
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';
import { prod, dev } from "../utils/env";
// mock

const TABLE_HEAD = [
  { id: 'exness', label: 'Exness ID', alignRight: false },
  { id: 'server', label: 'Server', alignRight: false },
  { id: 'password', label: 'Password', alignRight: false },
  { id: 'passview', label: 'Passview', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: 'message', label: 'Message', alignRight: false },
  { id: 'action', label: 'Action', alignRight: false },
];

// ----------------------------------------------------------------------

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

export default function ExnessPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(null);
  const [openDetail, setOpenDetail] = useState(null);

  const [listExness, setListExness] = useState([]);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');
  const [isModalEditOpen, setIsModalEditOpen] = useState();

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [isLoading, setIsLoading] = useState(false);
  const [currentExness, setCurrentExness] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
  const [currentEmail] = useState(localStorage.getItem("email") ? localStorage.getItem("email") : "");
  const [currentAccessToken] = useState(localStorage.getItem("access_token") ? localStorage.getItem("access_token") : "");
  const [image, setImage] = useState("");

  const [isAdmin, setIsAdmin] = useState(currentEmail.includes("root"));
  

  useEffect(() => {
    let endpoint = "";
    if (isAdmin) {
      endpoint = `${prod}/api/v1/admin/get-all-exness`;
    } else {
      endpoint = `${prod}/api/v1/secured/get-all-exness/${currentEmail}`;
    }
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
        setListExness(response.data);
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

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openModalDetail = (id) => {
    setIsModalDetailOpen(true);
    setCurrentExness(id);
  };

  const closeModalDetail = () => {
    setIsModalDetailOpen(false);
  };

  const openModalEdit = (id) => {
    setIsModalEditOpen(true);
    setCurrentExness(id);
  };

  const closeModalEdit = () => {
    setIsModalEditOpen(false);
  };

  useEffect(() => {
    setIsLoading(true);
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return (() => {
      clearTimeout(timeout);
    })
  }, []);

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

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
        <title> Exness </title>
        <link rel='icon' type='image/x-icon' href='/assets/logo.svg' />

      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="end" mb={5}>
          <Typography className='exness-title' variant="h4" gutterBottom>
            Exness
          </Typography>
          {isAdmin ? <Button onClick={openModal} variant="contained" startIcon={<Iconify icon="eva:plus-fill" />}>
            Add new Exness ID
          </Button> : ""}
          <ModalExness className="abc" isOpen={isModalOpen} onClose={closeModal} />
        </Stack>

        <Card>
          <UserListToolbar currentChose={selected} numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} />

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
                {isAdmin ? <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const selectedUser = selected.indexOf(row) !== -1;
                    const { exnessId, server, password, passview, status, message } = row;
                    let messageConvert = "";
                    if (message && message.includes("https://")) {
                      messageConvert = "";
                    } else {
                      messageConvert = message;
                    }

                    return (
                      <TableRow hover key={exnessId} tabIndex={-1} role="checkbox" selected={selectedUser}>
                        {/* <TableCell padding="checkbox">
                          <Checkbox checked={selectedUser} onChange={(event) => handleClick(event, exnessId)} />
                        </TableCell> */}

                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="subtitle2" noWrap>
                              {exnessId}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="subtitle2" noWrap>
                              {server}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="subtitle2" noWrap>
                              {password}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="subtitle2" noWrap>
                              {passview}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell align="left">
                          <Label color={(status ? "success" : "error")}>{status ? "Active" : "Inactive"}</Label>
                        </TableCell>

                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="subtitle2" noWrap>
                              {messageConvert}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            {message ? <Label onClick={() => {openModalDetail(exnessId)}} style={{ cursor: "pointer" }} color={("info")}>{"Detail"}</Label> :
                            <Label style={{ cursor: "not-allowed" }} color={("info")}>{"Detail"}</Label>}
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
                </TableBody> : <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const selectedUser = selected.indexOf(row) !== -1;
                    const { exnessId, server, password, passview, status, message, error } = row;
                    let messageConvert = "";
                    if (message && message.includes("https://")) {
                      messageConvert = "";
                    } else {
                      messageConvert = message;
                    }

                    return (
                      <TableRow hover key={exnessId} tabIndex={-1} role="checkbox" selected={selectedUser}>
                        {/* <TableCell padding="checkbox">
                          <Checkbox checked={selectedUser} onChange={(event) => handleClick(event, exnessId)} />
                        </TableCell> */}

                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="subtitle2" noWrap>
                              {exnessId}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="subtitle2" noWrap>
                              {server}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="subtitle2" noWrap>
                              {password}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="subtitle2" noWrap>
                              {passview}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell align="left">
                          <Label color={(status ? "success" : "error")}>{status ? "Active" : "Inactive"}</Label>
                        </TableCell>

                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="subtitle2" noWrap>
                              {error}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Label onClick={() => {openModalEdit(exnessId)}} style={{ cursor: "pointer" }} color={("info")}>{"Edit"}</Label>
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
                </TableBody>}
                <ModalDetail className="abc" isOpen={isModalDetailOpen} onClose={closeModalDetail} exness={currentExness}/>
                <ModalEdit className="abc" isOpen={isModalEditOpen} onClose={closeModalEdit} exness={currentExness}/>
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
      </Container>
    </>
  );
}
