import PageTransition from "@cmpt/animation/page";
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
      <main className="bg-base-300 py-8 flex-1 lg:border lg:mockup-window">
        <PageTransition>{children}</PageTransition>
      </main>
    </Sidebar>
  );
};

export default PublicLayout;
