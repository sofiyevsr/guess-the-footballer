import Navbar from "@cmpt/navigation/navbar";
import Sidebar from "@cmpt/navigation/sidebar";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const PublicLayout = ({ children }: Props) => {
  return (
    <Sidebar>
      <Navbar />
      <main className="bg-base-300 py-8 lg:h-full lg:border lg:mockup-window">
        {children}
      </main>
    </Sidebar>
  );
};

export default PublicLayout;
