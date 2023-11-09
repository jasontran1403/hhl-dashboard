import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { Button, FormGroup, FormLabel, Input, Typography, Grid } from '@mui/material';
import Swal from 'sweetalert2';
import Label from '../label';
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

    const handleSubmit = () => {
        onClose();
        if (exnessId === "" || server === "" || password === "" || passview === "" || email === "") {
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
                        <Label style={{ display: "flex", flexDirection: "column", alignItems: "stretch", marginBottom: "20px" }}>Email
                            <Input value={email} name="email" onChange={(e) => { setEmail(e.target.value) }} type="text" placeholder="Enter email..." autoComplete='false' />
                        </Label>
                        <Label style={{ display: "flex", flexDirection: "column", alignItems: "stretch", marginBottom: "20px" }}>Exness ID
                            <Input value={exnessId} name="exness" onChange={(e) => { setExnessId(e.target.value) }} type="text" placeholder="Enter exness id..." autoComplete='false' />
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
                        <Button onClick={handleSubmit}>Add</Button>
                    </Grid>
                </Box>
            </Modal>
        </div>
    );
}