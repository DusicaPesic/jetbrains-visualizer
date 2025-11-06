import axios, { AxiosError } from "axios";
import { ApiResponse } from "../types";

const BASE_URL = "https://opentdb.com/api.php";
const TOKEN_URL = "https://opentdb.com/api_token.php?command=request";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let ongoingFetch: Promise<ApiResponse> | null = null;

const TOKEN_STORAGE_KEY = "opentdb_token";
const getSessionToken = async (): Promise<string> => {
  try {
    const cached = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (cached) return cached;

    const response = await axios.get(TOKEN_URL);
    const token = response.data?.token || "";
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    return token;
  } catch (error) {
    console.error("Error getting session token:", error);
    return "";
  }
};

const fetchWithRetry = async (
  url: string,
  retries = 5,
  delayMs = 2000
): Promise<any> => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      const axiosErr = error as AxiosError | undefined;
      const status = axiosErr?.response?.status;
      const retryAfterHeader = axiosErr?.response?.headers?.["retry-after"];

      if (status === 429) {
        const serverDelay = retryAfterHeader
          ? Number(retryAfterHeader) * 1000
          : null;
        const wait = serverDelay || Math.min(delayMs * Math.pow(2, i), 16000);

        if (i < retries - 1) {
          console.log(`Rate limited, waiting ${wait}ms before retry...`);
          await delay(wait);
          continue;
        }
      }

      throw error;
    }
  }
};

export const fetchQuestions = async (
  amount: number = 50
): Promise<ApiResponse> => {
  if (ongoingFetch) return ongoingFetch;

  ongoingFetch = (async () => {
    try {
      const token = await getSessionToken();
      const tokenParam = token ? `&token=${token}` : "";

      const batchSize = 50;
      let remaining = amount;
      const allResults: any[] = [];

      while (remaining > 0) {
        const safeAmount = Math.min(remaining, batchSize);
        const url = `${BASE_URL}?amount=${safeAmount}${tokenParam}`;
        const data = await fetchWithRetry(url);

        if (data.response_code !== 0) {
          return {
            response_code: data.response_code || 1,
            results: allResults,
          };
        }

        const results = data.results || [];
        allResults.push(...results);

        if (results.length < safeAmount) break;

        remaining -= safeAmount;

        if (remaining > 0) await delay(250);
      }

      return { response_code: 0, results: allResults.slice(0, amount) };
    } catch (error) {
      console.error("Error fetching questions:", error);
      throw error;
    } finally {
      ongoingFetch = null;
    }
  })();

  return ongoingFetch;
};
