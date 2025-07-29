import { type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { ThemeName } from "~/ui/components/foundations/theming";
import { ThemeProvider } from "~/ui/components/contexts/ThemeContext";
import { FormatImageUrlProvider } from "~/ui/components/contexts/FormatImageUrlContext";
import { formatImageUrl } from "~/ui/components/utils/formatImageUrl";
import { Modal } from "~/ui/components/elements/Modal/Modal";

type LayoutProps = {
  theme?: ThemeName;
  child: ReactNode;
};

const Header = dynamic(
  import("../ui/features/header").then((mod) => mod.Header)
);

export function GameRoomLayout({ child }: LayoutProps) {
  return (
    <ThemeProvider>
      <FormatImageUrlProvider value={formatImageUrl}>
        <header>
          <Header />
        </header>
        <body className={`h-[100vh]`}>
          {child}
          <Modal />
        </body>
      </FormatImageUrlProvider>
    </ThemeProvider>
  );
}
