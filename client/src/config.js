import axios from "axios";

const baseURL =
    process.env.NODE_ENV === "production"
        ? '/'
        : "http://localhost:3040/";

export const axiosInstance = axios.create({
    baseURL,
})