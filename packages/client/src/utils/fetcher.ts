interface FetchConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  payload?: Record<string, string | number>;
}

interface FetchResult {
  status: number;
  statusText: string;
  data: Record<string, any>;
}

export default async function fetcher(
  config: FetchConfig = { url: null, method: 'GET', payload: null }
): Promise<FetchResult> {
  const option: RequestInit = {
    method: config.method,
    mode: 'cors',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    ...(config.payload && { body: JSON.stringify(config.payload) })
  };

  const response: Response = await fetch(config.url, option);
  const data = await response.json();

  return {
    status: response.status,
    statusText: response.statusText,
    data
  };
}
