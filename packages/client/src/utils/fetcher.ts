interface FetchConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  payload?: any;
}

interface FetchResult {
  status: number;
  statusText: string;
  data: any;
}

export default async function fetcher(
  config: FetchConfig = { url: null, method: 'GET', payload: null },
  requestContext = null
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

  if (requestContext) {
    // Use [] notation to make TS happy.
    option.headers['cookie'] = requestContext.req.headers.cookie;
  }

  console.log('option :>> ', option);
  const response: Response = await fetch(config.url, option);
  console.log('response :>> ', response);

  const data = await response.json();

  return {
    status: response.status,
    statusText: response.statusText,
    data
  };
}
