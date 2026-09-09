import { Facebook, Instagram, Mail, Twitter, Youtube } from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import Button from "./Button";

interface NavLinkProps {
  to: string;
  active: boolean;
  children: React.ReactNode;
}

const MobileNavLink: React.FC<NavLinkProps> = ({ to, active, children }) => {
  const { theme } = useTheme();

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Link
      to={to}
      onClick={handleClick}
      className={`px-2 py-1 rounded-md text-sm text-center ${
        active
          ? theme === "dark"
            ? "text-teal-400 border-t-2 border-teal-400"
            : "text-teal-600 border-t-2 border-teal-600"
          : theme === "dark"
          ? "text-gray-400"
          : "text-gray-600"
      }`}
    >
      {children}
    </Link>
  );
};

const Footer: React.FC = () => {
  const { theme } = useTheme();
  const location = useLocation();

  const footerLinks = [
    {
      title: "Top Countries",
      links: [
        { label: "Japan", href: "/destinations/japan" },
        { label: "Italy", href: "/destinations/italy" },
        { label: "France", href: "/destinations/france" },
        { label: "Spain", href: "/destinations/spain" },
        { label: "Thailand", href: "/destinations/thailand" },
        { label: "Australia", href: "/destinations/australia" },
      ],
    },
    {
      title: "Top Cities",
      links: [
        { label: "Paris", href: "/destinations/paris" },
        { label: "Rome", href: "/destinations/rome" },
        { label: "Barcelona", href: "/destinations/barcelona" },
        { label: "Bangkok", href: "/destinations/bangkok" },
        { label: "Singapore", href: "/destinations/singapore" },
        { label: "Seoul", href: "/destinations/seoul" },
      ],
    },
  ];

  const companyLinks = [
    { label: "About", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
    { label: "Blog", href: "/blog" },
    { label: "Help Center", href: "/help" },
  ];

  return (
    <>
      <nav
        className={`md:hidden fixed bottom-0 left-0 right-0 ${
          theme === "dark"
            ? "bg-gray-900 border-t border-gray-800"
            : "bg-white border-t border-gray-200"
        } flex justify-around py-3`}
      >
        <MobileNavLink
          to="/itinerary"
          active={location.pathname === "/itinerary"}
        >
          Itinerary
        </MobileNavLink>
        <MobileNavLink to="/chat" active={location.pathname === "/chat"}>
          Chat
        </MobileNavLink>
        <MobileNavLink
          to="/expenses"
          active={location.pathname === "/expenses"}
        >
          Expenses
        </MobileNavLink>
      </nav>

      <footer className="pt-16 pb-8">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <Link to="/" className="flex items-center space-x-2 mb-4">
                <div className="text-primary-500 h-8 w-8">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.5 19H9a7 7 0 1 1 0-14h11l-4 5.5" />
                    <path d="M14 10l-3 3" />
                    <path d="M5 19l12-12" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-primary-500">
                  travelbuddy
                </span>
              </Link>
              <p className="mb-6">
                Your ultimate travel planning companion. Discover, plan, and
                share your adventures.
              </p>
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3">Get the app</h3>
                <div className="flex flex-col space-y-2">
                  <a href="#" className="w-36">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                      alt="Download on the App Store"
                      className="h-10"
                    />
                  </a>
                  <a href="#" className="w-36">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                      alt="Get it on Google Play"
                      className="h-10"
                    />
                  </a>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-3">Follow us</h3>
                <div className="flex space-x-4">
                  {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                    <a
                      key={i}
                      href="#"
                      className="text-gray-500 hover:text-primary-500 transition-colors"
                    >
                      <Icon size={20} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-3 grid sm:grid-cols-2">
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
                {footerLinks.map((section, index) => (
                  <div key={index}>
                    <h3 className="text-sm font-semibold mb-4">
                      {section.title}
                    </h3>
                    <ul className="space-y-2">
                      {section.links.map((link, i) => (
                        <li key={i}>
                          <Link
                            to={link.href}
                            className="text-sm hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-sm font-semibold mb-4">Company</h3>
                  <ul className="space-y-2">
                    {companyLinks.map((link, i) => (
                      <li key={i}>
                        <Link
                          to={link.href}
                          className="text-sm hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-4">Newsletter</h3>
                  <p className="text-sm mb-4">
                    Sign up to get travel tips and the latest destination
                    trends.
                  </p>
                  <div className="flex">
                    <input
                      type="email"
                      placeholder="Your email"
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 flex-grow"
                    />
                    <Button
                      variant="primary"
                      className="rounded-l-none"
                      aria-label="Subscribe"
                    >
                      <Mail size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr className="my-8" />

          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">
              © {new Date().getFullYear()} Travelbuddy. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {["terms", "privacy", "cookies", "security"].map((item) => (
                <Link
                  key={item}
                  to={`/${item}`}
                  className="text-sm hover:text-primary-500 dark:hover:text-primary-400"
                >
                  {item.charAt(0).toUpperCase() +
                    item.slice(1).replace("-", " ")}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
