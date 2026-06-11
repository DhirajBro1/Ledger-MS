import AsyncStorage from "@react-native-async-storage/async-storage";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
}

const AUTH_TOKEN_KEY = "auth.token.v1";
const AUTH_USER_KEY = "auth.user.v1";

const readResponseError = async (response: Response) => {
  const contentType = response.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      const json = await response.json();
      return json?.message || JSON.stringify(json);
    }

    const text = await response.text();
    return text || `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
};

export const authStore = {
  // Save token and user to AsyncStorage
  async saveAuth(token: string, user: AuthUser): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(AUTH_TOKEN_KEY, token),
        AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user)),
      ]);
    } catch (error) {
      console.error("Error saving auth:", error);
      throw error;
    }
  },

  // Retrieve stored auth state
  async getAuth(): Promise<{ token: string | null; user: AuthUser | null }> {
    try {
      const [token, userJson] = await Promise.all([
        AsyncStorage.getItem(AUTH_TOKEN_KEY),
        AsyncStorage.getItem(AUTH_USER_KEY),
      ]);

      let user: AuthUser | null = null;
      if (userJson) {
        user = JSON.parse(userJson);
      }

      return { token, user };
    } catch (error) {
      console.error("Error retrieving auth:", error);
      return { token: null, user: null };
    }
  },

  // Clear auth (logout)
  async clearAuth(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(AUTH_TOKEN_KEY),
        AsyncStorage.removeItem(AUTH_USER_KEY),
      ]);
    } catch (error) {
      console.error("Error clearing auth:", error);
      throw error;
    }
  },

  // Register new user
  async register(
    apiBaseUrl: string,
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
  ): Promise<{ token: string; user: AuthUser }> {
    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      if (!response.ok) {
        const errorMessage = await readResponseError(response);
        throw new Error(errorMessage || "Registration failed");
      }

      const data = await response.json();
      await this.saveAuth(data.token, data.user);
      return data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  // Login user
  async login(
    apiBaseUrl: string,
    email: string,
    password: string,
  ): Promise<{ token: string; user: AuthUser }> {
    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorMessage = await readResponseError(response);
        throw new Error(errorMessage || "Login failed");
      }

      const data = await response.json();
      await this.saveAuth(data.token, data.user);
      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      await this.clearAuth();
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  },
};
