import dayjs, { Dayjs } from "dayjs";
import UTC from "dayjs/plugin/utc";
import relativeTime from "dayjs/plugin/relativeTime";
import duration from "dayjs/plugin/duration";

dayjs.extend(UTC);
dayjs.extend(duration);
dayjs.extend(relativeTime);

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

export function getTimeDifference(
  from: Dayjs,
  to: Dayjs,
  raw: boolean = false
) {
  const diff = dayjs.duration(from.diff(to));
  if (raw === true) return diff;
  return diff.humanize();
}

export function runInDev(callback: () => void) {
  if (process.env.NODE_ENV === "production") return;
  callback();
}
