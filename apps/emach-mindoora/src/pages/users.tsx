import { Layout } from "~/components/Layouts";
import { UserProfiles } from "~/components/ui/features/users/userProfile";
import { NotificationChat } from "~/components/ui/features/PBChat/Notifications";
import { useRecoilState } from "recoil";
import { loadingRecoilState } from "~/utils/atom/loading.atom";
import { useEffect } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import myToast from "~/utils/toast";

const User = () => {
  const [, setIsLoading] = useRecoilState(loadingRecoilState);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const session = await getSession();
      if (!session?.user) {
        await router.push("/");
      } else {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Layout
      child={
        <div className="pl-[2rem] pt-[8rem]">
          <UserProfiles />
          {/* Notification is for the next version */}
          {/* <NotificationChat /> */}
          {myToast()}
        </div>
      }
    />
  );
};

export default User;
