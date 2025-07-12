import { io } from "socket.io-client";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000"; // fallback for dev
const socket = io(BASE_URL);

export default socket;
