require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const NodeCache = require("node-cache");

const app = express();
const PORT = process.env.PORT || 5001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const cache = new NodeCache({
  stdTTL: 45,
  checkperiod: 20,
  useClones: false,
});

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

const cg = axios.create({
  baseURL: "https://api.coingecko.com/api/v3",
  timeout: 15000,
});

if (process.env.COINGECKO_API_KEY) {
  cg.defaults.headers.common["x-cg-demo-api-key"] = process.env.COINGECKO_API_KEY;
}

const cacheKey = (path, params = {}) => `${path}:${JSON.stringify(params)}`;

async function getWithCache(path, params = {}, ttl = 45) {
  const key = cacheKey(path, params);
  const cached = cache.get(key);

  if (cached) {
    return { data: cached, fromCache: true };
  }

  const response = await cg.get(path, { params });
  cache.set(key, response.data, ttl);
  return { data: response.data, fromCache: false };
}

function handleApiError(error, res) {
  if (error.response) {
    return res.status(error.response.status).json({
      error: "Coin API request failed",
      details: error.response.data,
    });
  }

  return res.status(500).json({
    error: "Unexpected server error",
    details: error.message,
  });
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, timestamp: Date.now() });
});

app.get("/api/coins", async (req, res) => {
  const {
    vsCurrency = "usd",
    page = 1,
    perPage = 25,
    search = "",
    ids = "",
  } = req.query;

  try {
    const params = {
      vs_currency: vsCurrency,
      order: "market_cap_desc",
      per_page: perPage,
      page,
      sparkline: true,
      price_change_percentage: "24h",
      locale: "en",
    };

    if (ids) {
      params.ids = ids;
      params.per_page = Math.min(ids.split(",").length, 250);
      params.page = 1;
    }

    const { data, fromCache } = await getWithCache("/coins/markets", params, 35);

    const normalizedSearch = String(search).trim().toLowerCase();
    const coins = normalizedSearch
      ? data.filter(
          (coin) =>
            coin.name.toLowerCase().includes(normalizedSearch) ||
            coin.symbol.toLowerCase().includes(normalizedSearch)
        )
      : data;

    res.json({
      fromCache,
      page: Number(page),
      perPage: Number(perPage),
      coins,
    });
  } catch (error) {
    handleApiError(error, res);
  }
});

app.get("/api/coin/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const params = {
      localization: false,
      tickers: false,
      market_data: true,
      community_data: false,
      developer_data: false,
      sparkline: true,
    };

    const { data, fromCache } = await getWithCache(`/coins/${id}`, params, 60);

    res.json({ fromCache, coin: data });
  } catch (error) {
    handleApiError(error, res);
  }
});

app.get("/api/coin/:id/chart", async (req, res) => {
  const { id } = req.params;
  const { days = "7", vsCurrency = "usd" } = req.query;

  try {
    const params = {
      vs_currency: vsCurrency,
      days,
      interval: Number(days) <= 1 ? "hourly" : "daily",
    };

    const ttl = Number(days) <= 1 ? 30 : 90;
    const { data, fromCache } = await getWithCache(
      `/coins/${id}/market_chart`,
      params,
      ttl
    );

    res.json({ fromCache, chart: data });
  } catch (error) {
    handleApiError(error, res);
  }
});

app.get("/api/trending", async (_req, res) => {
  try {
    const { data, fromCache } = await getWithCache("/search/trending", {}, 120);

    res.json({
      fromCache,
      coins: data.coins.map((entry) => entry.item),
    });
  } catch (error) {
    handleApiError(error, res);
  }
});

app.get("/api/markets", async (req, res) => {
  const { vsCurrency = "usd", perPage = 100 } = req.query;

  try {
    const [marketResult, globalResult] = await Promise.all([
      getWithCache(
        "/coins/markets",
        {
          vs_currency: vsCurrency,
          order: "market_cap_desc",
          per_page: perPage,
          page: 1,
          sparkline: false,
          price_change_percentage: "24h",
        },
        50
      ),
      getWithCache("/global", {}, 120),
    ]);

    const coins = marketResult.data.filter(
      (coin) => typeof coin.price_change_percentage_24h === "number"
    );

    const topGainers = [...coins]
      .sort(
        (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h
      )
      .slice(0, 5);

    const topLosers = [...coins]
      .sort(
        (a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h
      )
      .slice(0, 5);

    res.json({
      fromCache: marketResult.fromCache && globalResult.fromCache,
      topGainers,
      topLosers,
      global: globalResult.data.data,
    });
  } catch (error) {
    handleApiError(error, res);
  }
});

app.listen(PORT, () => {
  console.log(`CryptoTracker server running on http://localhost:${PORT}`);
});
