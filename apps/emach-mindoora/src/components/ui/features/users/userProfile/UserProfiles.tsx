import { Grid } from "@mui/material";
import AddNewFriends from "./addNewFriends/AddNewFriends";
import UserAccount from "./userAccount/UserAccount";
import Image from "next/image";

export const UserProfiles = () => {
  return (
    <Grid container spacing={1} padding={1}>
      <Grid item xs={12} lg={8} xl={8}>
        <UserAccount />
      </Grid>
      <Grid item xs={12} lg={4} xl={4}>
        <Image
          src="/assets/mindoora.png"
          alt="mindoora-logo"
          width="300"
          height="300"
        />
        <AddNewFriends />
      </Grid>
    </Grid>
  );
};
