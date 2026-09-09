import { useAuth } from "../context/AuthContext";
import Logo from "./shared/Logo";
import NavigationLink from "./shared/NavigationLink";
import ThemeToggle from "./ThemeToggle";

const Header = () => {
  const auth = useAuth();

  return (
    <header className="w-full bg-white dark:bg-gray-900 shadow-md p-4">
      <div className="container mx-auto flex items-center justify-between">
        <Logo />

        <div className="flex items-center gap-4">
          {/* Theme Toggle Button */}
          <ThemeToggle />
          {/* Navigation Buttons */}
          {auth?.isLoggedIn ? (
            <>
              <NavigationLink
                to="/chat"
                text="Go To Chat"
                bg="#00fffc"
                textColor="black"
              />
              <NavigationLink
                to="/"
                text="Logout"
                bg="#51538f"
                textColor="white"
                onClick={auth.logout}
              />
            </>
          ) : (
            <>
              <NavigationLink
                to="/login"
                text="Login"
                bg="#00fffc"
                textColor="black"
              />
              <NavigationLink
                to="/signup"
                text="Signup"
                bg="#51538f"
                textColor="white"
              />
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
