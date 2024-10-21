import { useEffect, useState } from 'react';

const useIsFirstRender = (): boolean => {
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    setIsFirstRender(false);
  }, []);

  return isFirstRender;
};

export default useIsFirstRender;
