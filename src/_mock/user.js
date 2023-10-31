import { faker } from '@faker-js/faker';
import { sample } from 'lodash';
import axios from "axios";
// ----------------------------------------------------------------------
const email = localStorage.getItem("email") ? localStorage.getItem("email") : "";
const accessToken = localStorage.getItem("access_token") ? localStorage.getItem("access_token") : "";

const users = [];

export default users;

