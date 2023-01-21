import { motion, useAnimation } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

function RouterProgressBar() {
  const router = useRouter();
  const valueRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const resetTimeoutRef = useRef<NodeJS.Timeout>();
  const control = useAnimation();

  const resetTimeouts = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
  };

  useEffect(() => {
    const animate = (width: string, duration: number, delay?: number) => {
      control.stop();
      control.start({ width, transition: { duration, delay } });
    };

    const work = () => {
      if (valueRef.current + 15 >= 100) {
        valueRef.current = 100;
        animate("100vw", 0.6);
      } else {
        valueRef.current += 15;
        animate(valueRef.current + "vw", 0.6);
        timeoutRef.current = setTimeout(() => {
          work();
        }, 300);
      }
    };

    const handleStart = () => {
      resetTimeouts();
      work();
    };

    const handleStop = () => {
      resetTimeouts();
      if (valueRef.current !== 100) {
        animate("100vw", 0.4);
      }
      resetTimeoutRef.current = setTimeout(() => {
        animate("0", 0);
      }, 400);
      valueRef.current = 0;
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleStop);
    router.events.on("routeChangeError", handleStop);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleStop);
      router.events.off("routeChangeError", handleStop);
    };
  }, [router, control]);

  return (
    <motion.div
      className="h-1 bg-red-500 fixed top-0 left-0 z-50"
      animate={control}
    />
  );
}
export default RouterProgressBar;
