import { IoIosArrowForward } from "react-icons/io";
import { Styled } from "./QuickLink.styled";
import { useRecoilState } from "recoil";
import { modalRecoilState } from "~/ui/components/utils/atoms/ModalState";
import Feedback from "../feedback/Feedback";

const General = ({ toggle }) => {
  const [, setModalState] = useRecoilState(modalRecoilState);

  const handleModalFeedback = () => {
    setModalState({
      open: true,
      modalComponent: <Feedback />,
    });
  };

  const oursServices = [
    {
      name: "Feedback",
      onClick: handleModalFeedback,
    },
    {
      name: "About us",
      link: "/aboutus",
    },
    {
      name: "Terms of use",
      link: "/terms&condition",
    },
    {
      name: "Privacy Policy",
      link: "/policy",
    },
  ];

  return (
    <div className="m-4 flex-col text-white md:pl-16">
      <div className="flex flex-col">
        <h1 className="pb-3 font-bold lg:text-xl xl:text-2xl">General</h1>

        {oursServices.map((item, index) => (
          <a
            key={index}
            href={item.link}
            onClick={item.onClick}
            className="mt-4 flex flex-row"
          >
            <IoIosArrowForward className="mr-2 mt-1 text-white" />
            <Styled.CustomLink>{item.name}</Styled.CustomLink>
          </a>
        ))}
      </div>
    </div>
  );
};

export default General;
