import { apiSetup } from "~/utils/api/api";
import { Styled } from "./Feedback.styled";
import { endPoints } from "~/utils/api/route";
import toast from "react-hot-toast";
import Image from "next/image";
import { useRecoilState } from "recoil";
import { modalRecoilState } from "~/ui/components/utils/atoms/ModalState";
import { FeedbackModalWrapper } from "~/styles/mixins.styled";
import { FeedbackFace } from "./FeedbackFace";

const Feedback = () => {
  const [, setModal] = useRecoilState(modalRecoilState);

  const handleOnSubmit = async (e: any) => {
    e.preventDefault();
    const feedback = e.target.feedback.value;
    const score = e.target.score.value;

    const formData = {
      feedback,
      score,
    };

    const api = await apiSetup();

    try {
      const res = await api.post(endPoints.feedback.create, formData);
      if (res.status === 201) {
        toast.success(res.data.message);
      }
    } catch (e: any) {
      console.log(e.response.data.message);
      toast.error("Your Last Feedback is under consideration");
    }
    setModal({
      open: false,
      modalComponent: <></>,
    });
  };

  return (
    <FeedbackModalWrapper>
      <Image src="/assets/mindoora.png" alt="game" width={200} height={50} />
      <form action="#" onSubmit={handleOnSubmit}>
        <h5>
          How is your experience with Mindoora?
          <span className="text-1xl pl-2 text-red-500">*</span>
        </h5>
        <FeedbackFace />
        {/*  <div className="my-4 grid h-16 grid-cols-5 gap-4">
          {feedbackWebsite.map((item, index) => (
            <Styled.Item key={index}>
              <label htmlFor={item.id}>
                <Styled.Radio
                  type="radio"
                  name="score"
                  id={item.id}
                  value={index + 1}
                  defaultChecked={index === 2 ? true : false}
                />
                <Styled.Emoji role="img" aria-label={item.title}>
                  {item.emoji}
                </Styled.Emoji>
              </label>
            </Styled.Item>
          ))}
        </div>
        <label htmlFor="email" className="font-semibold text-white">
          <p className="mb-2">
            Do you have any thoughts you&lsquo;d like to share?
          </p>
          <textarea
            name="feedback"
            id=""
            className="registerTextInput mb-4 mt-1 h-32 bg-[#120D57]"
            placeholder="Share your feedback here ..."
          ></textarea>
        </label>
        <button
          className="mb-2 mt-2 rounded-lg bg-[#FF6F40] px-4 py-2 font-semibold text-white hover:opacity-75"
          type="submit"
        >
          Submit Feedback
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
        </div> */}
      </form>
    </FeedbackModalWrapper>
  );
};

export default Feedback;

export const feedbackWebsite = [
  { id: "w1", emoji: "😡", title: "Bad" },
  { id: "w2", emoji: "😕", title: "Not Bad" },
  { id: "w3", emoji: "😐", title: "Average" },
  { id: "w4", emoji: "😊", title: "Good" },
  { id: "w5", emoji: "😍", title: "Excellent" },
];
