import dayjs from "dayjs";
import UTC from "dayjs/plugin/utc";

dayjs.extend(UTC);

export function shuffleArray<T>(array: T[]) {
  const newArr: T[] = [...array];
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export function getTodayInUTC() {
  return dayjs().utc().format("DD-MM-YYYY");
}

export function runInDev(callback: () => void) {
  if (process.env.NODE_ENV === "production") return;
  callback();
}
