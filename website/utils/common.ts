import dayjs, { Dayjs } from "dayjs";
import UTC from "dayjs/plugin/utc";
import relativeTime from "dayjs/plugin/relativeTime";
import duration from "dayjs/plugin/duration";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(UTC);
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

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

export function formatUnixTimestamp(date: number, format: string) {
  return dayjs(date).format(format);
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

export function getRelativeTimeFromUnix(date: number) {
  return dayjs(date).from(dayjs());
}

export function runInDev(callback: () => void) {
  if (process.env.NODE_ENV === "production") return;
  callback();
}
