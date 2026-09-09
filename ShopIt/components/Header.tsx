import { Suspense } from "react";
import ClientHeader from "./ClientHeader";

const Header = () => {
  return (
    <Suspense
      fallback={
        <div className="h-20 bg-background border-b border-border animate-pulse" />
      }
    >
      <ClientHeader />
    </Suspense>
  );
};

export default Header;
