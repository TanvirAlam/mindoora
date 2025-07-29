import { apiSetup } from "~/utils/api/api";
import { Styled } from "./Feedback.styled";
import { endPoints } from "~/utils/api/route";
import toast from "react-hot-toast";
import Image from "next/image";
import {useRecoilState} from 'recoil'
import { modalRecoilState } from "~/ui/components/utils/atoms/ModalState";

const FeedbackGame = ({gameId, playerId}: {gameId: string; playerId: string}) => {
  const [,setModal] = useRecoilState(modalRecoilState)


  const handleOnSubmit = async (e: any) => {
    e.preventDefault();
    const score = e.target.score.value; 

    const formData = {
      score,
      gameId,
      playerId
    };

    const api = await apiSetup();

    try {
      const res = await api.post(endPoints.gameScore.create, formData);
      if (res.status === 201) {
        toast.success(res.data.message);
      }
    } catch (e: any) {
      console.log(e.response.data.message);
      toast.error("You Already Have Given Star.");
    }
    setModal({
      open: false,
      modalComponent: <></>
    })
  };

  return (
    <Styled.FeedbackContainer>
      <h1 className="mb-2 text-xl font-semibold text-white md:text-2xl">
       Give Star to this Game
      </h1>
      <form
        action=""
        className="flex w-full flex-col "
        onSubmit={handleOnSubmit}
      >
        <p className="font-semibold text-white">
          How is the game You Played?
          <span className="text-green-500">*</span>
        </p>
        <div className="my-4 grid h-16 grid-cols-5 gap-4">
          {feedbackWebsite.map((item, index) => (
            <Styled.Item key={index}>
              <label htmlFor={item.id}>
                <Styled.Radio
                  type="radio"
                  name="score"
                  id={item.id}
                  value={index + 1}
                  defaultChecked={index === 2? true: false}
                />
                <Styled.Emoji role="img" aria-label={item.title}>
                  {item.emoji}
                </Styled.Emoji>
              </label>
            </Styled.Item>
          ))}
        </div>
        <button
          className="mb-2 mt-2 rounded-lg bg-[#FF6F40] px-4 py-2 font-semibold text-white hover:opacity-75"
          type="submit"
        >
          Submit Stars
        </button>
        <div>
          <a
            href="https://1vtpgt5rocn.typeform.com/to/vkCMhsuS"
            className="font-large inline-flex items-center justify-center rounded-lg p-5 text-white hover:bg-gray-100 hover:text-gray-900 dark:bg-green-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <Image
              src="/assets/survay.png"
              alt="Survey"
              width={50}
              height={50}
            />
            <span className="w-full">Click to go to Survay!</span>
            <svg
              className="ms-2 h-4 w-4 rtl:rotate-180"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 10"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M1 5h12m0 0L9 1m4 4L9 9"
              />
            </svg>
          </a>
        </div>
      </form>
    </Styled.FeedbackContainer>
  );
};

export default FeedbackGame;

export const feedbackWebsite = [
  { id: "w1", emoji: "😡", title: "Bad" },
  { id: "w2", emoji: "😕", title: "Not Bad" },
  { id: "w3", emoji: "😐", title: "Average" },
  { id: "w4", emoji: "😊", title: "Good" },
  { id: "w5", emoji: "😍", title: "Excellent" },
];
