import type { AnimationItem } from "lottie-web";
import { useEffect, useRef } from "react";

interface Props {
  path: string;
  loop?: boolean;
  autoplay?: boolean;
  start?: boolean;
  className?: string;
}

export function Lottie({
  path,
  start,
  className,
  loop = false,
  autoplay = true,
}: Props) {
  const animation = useRef<AnimationItem>();
  const divRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      animation.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (
      start === false ||
      initialized.current === true ||
      animation.current?.isLoaded
    )
      return;
    initialized.current = true;
    import("lottie-web")
      .then((module) => {
        if (mounted.current === false) return;
        animation.current = module.default.loadAnimation({
          container: divRef.current!,
          path,
          loop,
          autoplay,
        });
      })
      .catch((_) => {});
    return () => {
      animation.current?.destroy();
    };
  }, [start]);
  return <div className={className} ref={divRef} />;
}
