import Image from "next/image";
const Points = () => {
  return (
    <div className="flex-row-center mt-2 ">
      <div className="relative h-6 w-6">
        <Image
          fill
          src="/assets/fire.svg"
          alt="fire icon"
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <p className="text-sm">1230 points</p>
    </div>
  );
};

export default Points;
