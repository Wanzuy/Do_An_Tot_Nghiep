import axios from "axios";
import queryString from "query-string";
import { localDataNames } from "../constants/appInfo";

const baseURL = "http://localhost:3003";
// const baseURLProduction = "https://fire-alarm.onrender.com";

const getAccessToken = () => {
  const res = localStorage.getItem(localDataNames.authData);
  return res && JSON.parse(res).token;
};

const axiosClient = axios.create({
  baseURL: baseURL,
  paramsSerializer: (params) => queryString.stringify(params),
});

axiosClient.interceptors.request.use(async (config) => {
  const accessToken = getAccessToken();
  config.headers = {
    Authorization: accessToken && `Bearer ${accessToken}`,
    Accept: "application/json",
    ...config.headers,
  };

  return { ...config, data: config.data ?? null };
});

axiosClient.interceptors.response.use(
  (res) => {
    if (res.data && res.status >= 200 && res.status < 300) {
      return res.data;
    } else {
      return Promise.reject(res.data);
    }
  },
  (error) => {
    const { response } = error;
    return Promise.reject(response.data);
  }
);

export default axiosClient;
