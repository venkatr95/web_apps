// components/shared/NavigationLink.tsx
import { Link } from "react-router-dom";

const NavigationLink = ({
  to,
  text,
  bg = "#00fffc",
  textColor = "black",
  onClick,
}: {
  to: string;
  text: string;
  bg?: string;
  textColor?: string;
  onClick?: () => void;
}) => (
  <Link
    to={to}
    onClick={onClick}
    style={{
      backgroundColor: bg,
      color: textColor,
    }}
    className="px-4 py-2 rounded-md font-semibold text-sm transition hover:opacity-90"
  >
    {text}
  </Link>
);

export default NavigationLink;
