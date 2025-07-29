import type { GameResult } from "~/types/type";

const Table = ({ result }: { result: GameResult[] }) => {
  return (
    <div className="w-[95%] overflow-x-scroll md:w-auto">
      <table className="w-full text-sm table-auto">
        {result && result.length > 0 && (
          <thead className="bg-gradient-to-tr from-[#272358] to-[#433E7D]">
            <tr>
              <th className="md:px-4 px-2  py-2">Name</th>
              <th className="md:px-4 px-2  py-2">Answered</th>
              <th className="md:px-4 px-2  py-2">Right</th>
              <th className="md:px-4 px-2  py-2">Points</th>
            </tr>
          </thead>
        )}
        <tbody>
          {result.map((item: any, index: number) => (
            <tr
              key={index}
              className={index % 2 === 0 ? "bg-[#18144B]" : "bg-[#423E7D]"}
            >
              <td className="md:px-4 px-2  py-2 text-center">
                {Object.values(item)[0]}
              </td>
              <td className="md:px-4 px-2  py-2 text-center">
                {Object.values(item)[2]}
              </td>
              <td className="md:px-4 px-2  py-2 text-center">
                {Object.values(item)[3]}
              </td>
              <td className="md:px-4 px-2  py-2 text-center">
                {Object.values(item)[4]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
