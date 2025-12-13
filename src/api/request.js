import axios from "axios";

const request = axios.create({
  baseURL: "http://127.0.0.1:8000",
  timeout: 8000,
});

// 请求拦截器：自动加 Token
request.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器
request.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(err)
);

export default request;
