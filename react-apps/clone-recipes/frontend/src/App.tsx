import { Provider } from "react-redux";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import Header from "./components/layout/Header";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import HomePage from "./pages/home/HomePage";
import { AuthProvider } from "./providers/AuthProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import PrivateRoute from "./routes/PrivateRoute";
import { store } from "./store/store";

function App() {
  return (
    <ThemeProvider>
      <Provider store={store}>
        <Router>
          <AuthProvider>
            <div className="flex h-screen overflow-hidden">
              <div className="flex-1 flex flex-col min-w-0">
                <Header />
                <main className="flex-1">
                  <Routes>
                    <Route
                      path="/"
                      element={
                        <PrivateRoute>
                          <HomePage />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/forgot-password"
                      element={<ForgotPasswordPage />}
                    />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                  </Routes>
                </main>
              </div>
            </div>
          </AuthProvider>
        </Router>
      </Provider>
    </ThemeProvider>
  );
}

export default App;
