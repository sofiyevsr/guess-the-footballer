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
      <PageTransition>{children}</PageTransition>
    </Sidebar>
  );
};

export default PublicLayout;
