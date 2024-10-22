import { useState, type ReactElement } from "react";
import PublicLayout from "@cmpt/layout/public";
import OfficialListsView from "@modules/play/officialListsView";
import CommunityListsView from "@modules/play/communityListsView";
import { Lottie } from "@cmpt/misc/lottie";
import { NextSeo } from "next-seo";
import { AnimatePresence, motion } from "framer-motion";

const description =
  "Ready for a football trivia experience like no other? Choose from today's top leagues, legendary players, or the icons of the 90s, and set the stage for your perfect challenge. Want more control? Create and submit your own custom lists for the community to play! Whether it's tracking transfers, shirt numbers, or career stats, each game is tailored to test your football expertise. How many rounds can you handle? Dive in for a daily dose of football fun!";

function PreLocalPlay() {
  const [list, setList] = useState<"official" | "community">("official");
  const [direction, setDirection] = useState(1);

  return (
    <>
      <NextSeo title="Play" description={description} />
      <section className="flex flex-col justify-center items-center w-full max-w-full overflow-hidden">
        <Lottie path="/tactic.json" className="h-80 w-auto" loop />
        <h2 className="font-bold text-2xl md:text-3xl">PLAY TRIVIA</h2>
        <p className="text-gray-500 max-w-xl mx-12 my-2 text-center text-sm md:text-lg">
          {description}
        </p>
        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="mr-4 label-text font-bold text-lg">Official</span>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              onChange={(e) => {
                const next = e.currentTarget.checked ? "community" : "official";
                setList(next);
                setDirection(
                  list === "official" && next === "community" ? 1 : -1
                );
              }}
            />
            <span className="ml-4 label-text font-bold text-lg">Community</span>
          </label>
        </div>
        <div className="flex-1 w-full max-w-full relative">
          <AnimatePresence initial={false} mode="popLayout">
            {list === "official" && (
              <motion.div key="official">
                <OfficialListsView direction={direction} />
              </motion.div>
            )}
            {list === "community" && (
              <motion.div key="community">
                <CommunityListsView direction={direction} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}

PreLocalPlay.getLayout = (page: ReactElement) => (
  <PublicLayout>{page}</PublicLayout>
);

export default PreLocalPlay;
