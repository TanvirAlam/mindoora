import { type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { ThemeName } from "~/ui/components/foundations/theming";
import { ThemeProvider } from "~/ui/components/contexts/ThemeContext";
import { FormatImageUrlProvider } from "~/ui/components/contexts/FormatImageUrlContext";
import { formatImageUrl } from "~/ui/components/utils/formatImageUrl";
import { Modal } from "~/ui/components/elements/Modal/Modal";
import { SpeedInsights } from "@vercel/speed-insights/next";

type LayoutProps = {
  theme?: ThemeName;
  child: ReactNode;
};

const Header = dynamic(
  import("../ui/features/header").then((mod) => mod.Header)
);

const Footer = dynamic(
  import("../ui/features/footer").then((mod) => mod.Footer)
);

export function Layout({ child }: LayoutProps) {
  return (
    <ThemeProvider>
      <FormatImageUrlProvider value={formatImageUrl}>
        <header>
          <Header />
        </header>
        <body className={`h-[100vh]`}>
          {child}
          <Modal />
          {/* Vercel SpeedInsite: DO NOT REMOVE */}
          <SpeedInsights />
        </body>
        <footer>
          <Footer />
        </footer>
      </FormatImageUrlProvider>
    </ThemeProvider>
  );
}
