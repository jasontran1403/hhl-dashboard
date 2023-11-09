import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { styled } from '@mui/material/styles';
import { Button, FormGroup, FormLabel, Input, Typography, Grid } from '@mui/material';
import Swal from 'sweetalert2';
import Label from '../label';
import { prod, dev } from "../../utils/env";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '60%',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const StyledProductImg = styled('img')({
    top: 0,
    width: '60%',
    height: '60%',
    objectFit: 'cover',
    margin: 'auto',
});

export default function ModalEdit({ exness, isOpen, onClose }) {
    const navigate = useNavigate();
    const [currentAccessToken] = useState(localStorage.getItem("access_token") ? localStorage.getItem("access_token") : "");
    const [currentEmail] = useState(localStorage.getItem("email") ? localStorage.getItem("email") : "");
    const [url, setUrl] = useState("");
    const [exnessId, setExnessId] = useState("");
    const [server, setServer] = useState("");
    const [password, setPassword] = useState("");
    const [passview, setPassview] = useState("");
    const [isAdmin, setIsAdmin] = useState(currentEmail.includes("root"));
    const [code, setCode] = useState("");

    useEffect(() => {
        if (!isAdmin) {
            const config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: `${prod}/api/v1/secured/get-exness-info/${exness}`,
                headers: {
                    'Authorization': `Bearer ${currentAccessToken}`
                }
            };

            axios.request(config)
                .then((response) => {
                    setExnessId(response.data.exnessId);
                    setServer(response.data.server);
                    setPassword(response.data.password);
                    setPassview(response.data.passview);
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
        }
    }, [exness]);

    const handleSubmit = () => {
        if (exnessId === '' || server === '' || password === '' || passview === '' || code === '') {
            onClose();
            Swal.fire({
                title: "Vui lòng điền đủ thông tin để cập nhật Exness",
                icon: "error",
                timer: 3000,
                position: 'center',
                showConfirmButton: false
            })
            return;
        }

        const data = JSON.stringify({
            "email": currentEmail,
            "exness": exnessId,
            "server": server,
            "password": password,
            "passview": passview,
            "code": code
        });

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${prod}/api/v1/secured/edit-exness`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentAccessToken}`
            },
            "data": data
        };

        axios.request(config)
            .then((response) => {
                onClose();
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
                } else if (response.data.status === 404) {
                    Swal.fire({
                        title: response.data.message,
                        icon: "error",
                        timer: 3000,
                        position: 'center',
                        showConfirmButton: false
                    })
                }
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
    }

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
                        Edit Exness Information
                    </Typography>
                    <Grid item xs={12} sm={12} md={12} style={{ display: "flex", flexDirection: "column" }}>
                        <Label style={{ display: "flex", flexDirection: "column", alignItems: "stretch", marginBottom: "20px" }}>Exness ID
                            <Input readOnly value={exnessId} name="exness" onChange={(e) => { setExnessId(e.target.value) }} type="text" placeholder="Enter exness id..." autoComplete='false' />
                        </Label>
                        <Label style={{ display: "flex", flexDirection: "column", alignItems: "stretch", marginBottom: "20px" }}>Server
                            <Input value={server} name="server" onChange={(e) => { setServer(e.target.value) }} type="text" placeholder="Enter server..." autoComplete='false' />
                        </Label>
                        <Label style={{ display: "flex", flexDirection: "column", alignItems: "stretch", marginBottom: "20px" }}>Password
                            <Input value={password} name="password" onChange={(e) => { setPassword(e.target.value) }} type="text" placeholder="Enter password..." autoComplete='false' />
                        </Label>
                        <Label style={{ display: "flex", flexDirection: "column", alignItems: "stretch", marginBottom: "20px" }}>Passview
                            <Input value={passview} name="passview" onChange={(e) => { setPassview(e.target.value) }} type="text" placeholder="Enter passview..." autoComplete='false' />
                        </Label>
                        <Label style={{ display: "flex", flexDirection: "column", alignItems: "stretch", marginBottom: "20px" }}>2FA Authentication
                            <Input value={code} name="code" onChange={(e) => { setCode(e.target.value) }} type="text" placeholder="Enter 2fa..." autoComplete='false' />
                        </Label>
                        <Button onClick={handleSubmit}>Update</Button>
                    </Grid>
                </Box>
            </Modal>
        </div>
    );
}