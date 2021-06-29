interface IFetchConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  payload?: any;
}

interface IFetchResult {
  status: number;
  statusText: string;
  data: any;
}

export default async function fetcher(
  config: IFetchConfig = { url: null, method: 'GET', payload: null },
  requestContext = null
): Promise<IFetchResult> {
  const option: RequestInit = {
    method: config.method,
    mode: 'cors',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    ...(config.payload && { body: JSON.stringify(config.payload) })
  };

  if (requestContext) {
    // Use [] notation to make TS happy.
    option.headers['cookie'] = requestContext.req.headers.cookie;
  }

  const response: Response = await fetch(config.url, option);
  const data = await response.json();

  return {
    status: response.status,
    statusText: response.statusText,
    data
  };
}
