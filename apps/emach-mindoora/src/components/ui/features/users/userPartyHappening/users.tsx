import Image from "next/image";

const Users = ({ users }: any) => {
  return (
    <div className=" flex-row-center relative mt-2 flex-wrap gap-2">
      {users.map((user: any) => (
        <div key={user.id} className="w-[46%] rounded-2xl bg-[#383471] p-2">
          <div className="relative h-24 w-full overflow-hidden rounded-2xl">
            <Image
              fill
              src={user.image}
              alt={user.name}
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <h1 className="flex-row-center">{user.name}</h1>
          <div className="flex-row-center">
            <div className="relative h-4 w-4">
              <Image
                fill
                src="/assets/fire.svg"
                alt="fire icon"
                sizes="100vw"
                className="object-cover"
              />
            </div>
            <p>{user.point}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Users;
