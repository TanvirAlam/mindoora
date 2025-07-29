import { Grid } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const Custome404Page = () => {
  return (
    <Grid container>
      <Grid item xs={12} lg={6}>
        <div className="mt-24 flex h-[40vh] flex-col items-center justify-center lg:mt-0 lg:h-screen">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8 text-6xl font-bold"
          >
            404
          </motion.div>
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-4 text-2xl lg:text-4xl"
          >
            Lost in space
          </motion.div>
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mb-4 text-sm lg:text-xl"
          >
            You have reached the edge of the universe.
            <br />
            The page you requested could not be found. <br />
            Don&apos;t worry and return to the home page ❤️.
          </motion.div>
          <Link href="/">
            <motion.span
              variants={fadeIn}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.5, delay: 0.8 }}
              className="flex items-center justify-center rounded-2xl bg-[#130F54] px-4 py-2 font-semibold text-white hover:bg-[#1E1956]"
            >
              Back to Home
            </motion.span>
          </Link>
        </div>
      </Grid>
      <Grid item xs={12} lg={6}>
        <div className="relative flex h-[50vh] flex-col items-center justify-center lg:h-screen">
          <Image
            src="/assets/404.gif"
            alt="404 page"
            fill
            className="object-contain"
          />
        </div>
      </Grid>
    </Grid>
  );
};

export default Custome404Page;
