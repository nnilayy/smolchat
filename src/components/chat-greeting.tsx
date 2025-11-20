import { motion } from "framer-motion";
import moment from "moment";
import { WavingHand02Icon } from "hugeicons-react";

export const ChatGreeting = () => {
  const renderGreeting = (name: string) => {
    const date = moment();
    const hours = date.get("hour");
    if (hours < 12) return `Good Morning,`;
    if (hours < 18) return `Good Afternoon,`;
    return `Good Evening,`;
  };

  return (
    <div className="flex flex-row items-center justify-center w-full md:w-[720px] gap-2 px-4 md:px-0">
      <motion.h1
        className="text-3xl font-semibold py-2 text-center leading-9 tracking-tight text-zinc-800 dark:text-zinc-100"
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          transition: {
            duration: 1,
          },
        }}
      >
        <span className="text-zinc-300 dark:text-zinc-500 block">
          Greetings smolchatter,
        </span>
        What do you have in mind today?
      </motion.h1>
    </div>
  );
};
