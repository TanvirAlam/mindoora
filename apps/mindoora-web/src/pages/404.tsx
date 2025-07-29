import Custome404Page from "~/components/ui/features/Custome404Page";
import { Layout } from "../components/Layouts";

const NotFound = () => {
  return (
    <Layout
      child={
        <>
          <Custome404Page />
        </>
      }
    />
  );
};

export default NotFound;
