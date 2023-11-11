import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { Button, FormGroup, FormLabel, Input, Typography, Grid, Popover, MenuItem, TextField, InputAdornment, IconButton } from '@mui/material';
import Swal from 'sweetalert2';
import Label from '../label';
import Iconify from '../iconify';
import { prod, dev } from "../../utils/env";


const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '70%',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

export default function ModalExness({ isOpen, onClose }) {
    const navigate = useNavigate();
    const [currentEmail] = useState(localStorage.getItem("email") ? localStorage.getItem("email") : "");
    const [currentAccessToken] = useState(localStorage.getItem("access_token") ? localStorage.getItem("access_token") : "");
    const [exnessId, setExnessId] = useState("");
    const [server, setServer] = useState("");
    const [password, setPassword] = useState("");
    const [passview, setPassview] = useState("");
    const [email, setEmail] = useState("");
    const [listExness, setListExness] = useState([]);
    const [open2, setOpen2] = useState(null);
    const [currentExness, setCurrentExness] = useState("");

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

    const handleGetExness = () => {
        if (email === "") {
            return;
        }
        const config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `${prod}/api/v1/secured/get-all-exness-refferal/${email}`,
            headers: {
                'Authorization': `Bearer ${currentAccessToken}`
            }
        };

        axios.request(config)
            .then((response) => {
                if (response.data.length > 0) {
                    setListExness(response.data);
                    setCurrentExness(response.data[0].exnessId)
                } else {
                    Swal.fire({
                        title: `Tài khoản chưa sở hữu Exness, vui lòng thực hiện thêm Exness cho tài khoản ${email} trước!`,
                        icon: "error",
                        timer: 3000,
                        position: 'center',
                        showConfirmButton: false
                    });
                    onClose();
                }
            })
            .catch((error) => {
                console.log(error);
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
    }

    const handleSubmit = () => {
        onClose();
        if (exnessId === "" || server === "" || password === "" || passview === "" || email === "" || currentExness === "") {
            Swal.fire({
                title: "Vui lòng nhập thông tin exness!",
                icon: "error",
                timer: 3000,
                position: 'center',
                showConfirmButton: false
            });
            return;
        }

        const data = JSON.stringify({
            "email": email,
            "exness": exnessId,
            "server": server,
            "password": password,
            "passview": passview,
            "refferal": currentExness,
            "type": 1
        });

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${prod}/api/v1/admin/update-exness`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentAccessToken}`
            },
            "data": data
        };

        axios.request(config)
            .then((response) => {
                if (response.data.status === 200) {
                    Swal.fire({
                        title: response.data.message,
                        icon: "success",
                        timer: 3000,
                        position: 'center',
                        showConfirmButton: false
                    }).then(() => {
                        window.location.reload();
                    });
                } else if (response.data.status === 226) {
                    Swal.fire({
                        title: response.data.message,
                        icon: "error",
                        timer: 3000,
                        position: 'center',
                        showConfirmButton: false
                    });
                }
            })
            .catch((error) => {
                if (error.response.data.status === 404) {
                    Swal.fire({
                        title: error.response.data.message,
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
                console.log(error);
            });
    };

    return (
        <div>
            <Modal
                open={isOpen}
                onClose={onClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >

                <Box sx={style} className="flex">
                    <Typography style={{ marginBottom: "20px" }} variant="h4" gutterBottom>
                        Add Exness ID
                    </Typography>
                    <Grid item xs={12} sm={12} md={12} style={{ display: "flex", flexDirection: "column" }}>
                        <TextField onChange={(e) => { setEmail(e.target.value) }}
                            name="email"
                            value={email}
                            label="Email"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => handleGetExness()} edge="end">
                                            <Iconify icon={'formkit:submit'} />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        {listExness.length > 0 ? <Grid item xs={12} sm={12} md={12} >
                            <Input className="form-field " onClick={handleOpen2} type="text" value={currentExness === "" ? "Chọn exness để liên kết" : currentExness} style={{ minWidth: "200px", marginBottom: "15px", paddingLeft: "10px", cursor: "pointer!important", }} />
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
                        </Grid> : ""}
                        <TextField onChange={(e) => { setExnessId(e.target.value) }}
                            name="exnessId"
                            value={exnessId}
                            label="Exness ID"
                        />
                        <TextField onChange={(e) => { setServer(e.target.value) }}
                            name="server"
                            value={server}
                            label="Server"
                        />
                        <TextField onChange={(e) => { setPassword(e.target.value) }}
                            name="password"
                            value={password}
                            label="Password"
                        />
                        <TextField onChange={(e) => { setPassview(e.target.value) }}
                            name="passview"
                            value={passview}
                            label="Passview"
                        />
                        <Button onClick={handleSubmit}>Add</Button>
                    </Grid>
                </Box>
            </Modal>
        </div>
    );
}