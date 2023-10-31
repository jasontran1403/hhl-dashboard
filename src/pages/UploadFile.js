import * as React from 'react';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import { Helmet } from 'react-helmet-async';
// @mui
import Swal from 'sweetalert2';
import { Grid, Button, Container, Stack, Typography, TextField, Input } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useState } from 'react';
import { prod, dev } from "../utils/env";

// components
import Iconify from '../components/iconify';

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
    const [fileSelected, setFileSelected] = useState(null);
    const [isSelected, setIsSelected] = useState(true);
    const [currentEmail] = useState(localStorage.getItem("email") ? localStorage.getItem("email") : "");
    const [url, setUrl] = useState("");
    const [exness, setExness] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [currentAccessToken] = useState(localStorage.getItem("access_token") ? localStorage.getItem("access_token") : "");


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
        formData.append("exness", exness);

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
                if (response.data === "OK") {
                    Swal.fire({
                        title: "Uploaded successful, message will be returned to telegram!",
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
                            <Grid item xs={12} sm={12} md={12}>
                                <Input value={exness} name="exness" onChange={(e) => { setExness(e.target.value) }} type="text" placeholder="Enter exness id..." autoComplete='false' />
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

                </StyledContent>
            </Container>
        </>
    );
}
