import "~/styles/globals.css";
import "semantic-ui-css/semantic.min.css";

import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import CssBaseline from "@mui/material/CssBaseline";
import CmsContextProvider from "~/ui/components/contexts/CmsContext";
import { RecoilRoot } from "recoil";
import { store } from "../redux/store";
import { Provider } from "react-redux";
import { SocketProvider } from "~/utils/contexts/SocketContext";
import { appWithTranslation } from "next-i18next";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <Provider store={store}>
      <RecoilRoot>
        <SocketProvider>
          <SessionProvider session={session}>
            <CssBaseline />
            <CmsContextProvider>
              <Component {...pageProps} />
            </CmsContextProvider>
          </SessionProvider>
        </SocketProvider>
      </RecoilRoot>
    </Provider>
  );
};

export default appWithTranslation(MyApp);
