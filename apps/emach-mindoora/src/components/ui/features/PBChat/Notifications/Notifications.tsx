import { useEffect, useState } from "react";
import { Styled } from "./Notifications.styled";
import Image from "next/image";
import { apiSetup } from "~/utils/api/api";
import { endPoints } from "~/utils/api/route";
import { useRecoilState } from "recoil";
import { notificationsRecoilState } from "~/utils/atom/notifications.atom";
import { toast } from "react-hot-toast";
import { useRouter } from "next/router";

export const NotificationChat = () => {
  const [toggleNotification, setToggleNotification] = useState(false);
  const [nNotifications, setNNotifications] = useState(0);
  const [notifications, setNotifications] = useRecoilState(
    notificationsRecoilState
  );
  const Route = useRouter();

  const fetchNotification = async () => {
    const api = await apiSetup();
    try {
      const response = await api.get(
        `${endPoints.notification.all}?lastNotification=0`
      );
      if (response.status === 201) {
        setNNotifications(response.data.result.length);
        setNotifications(response.data.result);
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchNotification();
  }, []);

  return (
    <Styled.Floater
      onClick={() => (!toggleNotification ? setToggleNotification(true) : null)}
      chatToggle={toggleNotification}
    >
      <Styled.NotificationQuantity NotificationToggle={toggleNotification}>
        {nNotifications}
      </Styled.NotificationQuantity>
      <Styled.NotificationIcon
        size={35}
        NotificationToggle={toggleNotification}
      />
      <Styled.Notification NotificationToggle={toggleNotification}>
        <Styled.NotificationHeader>
          <Styled.Title>
            <Image src="/assets/mindoora.png" width="200" height="20" alt="" />
            <div className="flex flex-col">
              {notifications.map((notification, i) => (
                <div
                  key={i}
                  className=" border border-gray-200 pb-2"
                  onClick={() =>
                    window.open(`/user/${notification.from}`, "_blank")
                  }
                >
                  <p>{notification.notification}</p>
                </div>
              ))}
            </div>
          </Styled.Title>
          <Styled.CrossButton>
            <Styled.CloseNotification
              size={35}
              onClick={() => setToggleNotification(false)}
            />
          </Styled.CrossButton>
        </Styled.NotificationHeader>
        {/* dfdsf */}
      </Styled.Notification>
    </Styled.Floater>
  );
};
