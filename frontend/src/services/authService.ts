import { jwtDecode } from 'jwt-decode';
import { api } from './api';

interface LoginResponse {
  token: string;
}

interface RegisterResponse {
  message: string;
}

interface TokenDecoded {
  user_id: string;
  username: string;
}

export async function login(username: string, password: string) {
  try {
    console.log('Logging in...');
    const res = await api.post<LoginResponse>('/auth/login', { username, password });
    if (res.status !== 200) {
      throw new Error(`Login failed! Status: ${res.status}`);
    }

    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      console.log('token', res.data.token);
      const user = jwtDecode<TokenDecoded>(res.data.token);
      localStorage.setItem('userID', user.user_id);
      console.log('user id', user.user_id);
      console.log('username', user.username);
      localStorage.setItem('username', user.username);
      await api.patch(`/user/${user.user_id}`, { status: 'online' });
    }
    return res.data;
  } catch (err) {
    console.error('Login failed:', err);
    throw err; // This will be caught in your try-catch block in LoginPage
  }
}

export async function register(username: string, password: string) {
  const res = await api.post<RegisterResponse>('/auth/register', {
    username,
    password,
  });
  if (res.status !== 201) {
    throw new Error(`Registeration failed! Status: ${res.status}`);
  }
  console.log(res.data);
  return res.data;
}

// const isLoggedInContext = useContext(IsLoggedInContext)!;
// const { setIsLoggedIn } = isLoggedInContext;

// export const logout = async () => {
//   try {
//     await api.post('/auth/logout', { user_id: localStorage.getItem('userID') });
//     await api.patch(`/user/${localStorage.getItem('userID')}`, { status: 'offline' });
//   } catch (error) {
//     console.error('Logout failed:', error);
//   } finally {
//     localStorage.removeItem('token');
//     localStorage.removeItem('userID');
//     localStorage.removeItem('username');
//     setIsLoggedIn(false);
//     console.log('logged out');
//     window.location.href = '/login';
//   }
// };
