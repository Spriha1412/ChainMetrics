import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
  timeout: 15000,
});

export const cryptoApi = {
  getCoins: async ({ page = 1, perPage = 25, search = "", ids = "" } = {}) => {
    const { data } = await api.get("/coins", {
      params: { page, perPage, search, ids },
    });
    return data;
  },

  getCoin: async (id) => {
    const { data } = await api.get(`/coin/${id}`);
    return data;
  },

  getCoinChart: async (id, days = 7) => {
    const { data } = await api.get(`/coin/${id}/chart`, {
      params: { days },
    });
    return data;
  },

  getTrending: async () => {
    const { data } = await api.get("/trending");
    return data;
  },

  getMarkets: async () => {
    const { data } = await api.get("/markets");
    return data;
  },
};
