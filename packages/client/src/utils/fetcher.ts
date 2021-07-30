interface IFetchConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  payload?: any;
}

export interface IFetchResult<T> {
  data: T;
  status?: number;
  statusText?: string;
  userId?: string;
}

export default async function fetcher<T>(
  config: IFetchConfig = { url: null, method: 'GET', payload: null }
): Promise<IFetchResult<T>> {
  const token = localStorage.getItem('marfu.token');
  const option: RequestInit = {
    method: config.method,
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': token
    },
    ...(config.payload && { body: JSON.stringify(config.payload) })
  };

  const response: Response = await fetch(config.url, option);
  let data = null;
  const userId = response.headers.get('user-id');
  if (response.headers.get('Content-Type').includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  return {
    status: response.status,
    statusText: response.statusText,
    data,
    userId
  };
}
