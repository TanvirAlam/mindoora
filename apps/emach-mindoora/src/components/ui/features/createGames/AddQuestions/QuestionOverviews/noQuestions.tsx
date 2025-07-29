import Image from "next/image";

const NoQuestionsCreated = () => {
    return (
      <div className="relative flex h-full flex-col pb-10 items-center justify-between">
        <Image
          src={"/assets/no-games-created.png"}
          alt="no-games-created"
          width={300}
          height={500}
        />

        <Image
          src={"/assets/create-que.png"}
          alt="created-question"
          width={600}
          height={500}
        />
      </div>
    );
  };

  export default NoQuestionsCreated;
