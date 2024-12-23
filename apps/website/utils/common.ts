import dayjs, { Dayjs } from "dayjs";
import UTC from "dayjs/plugin/utc";
import relativeTime from "dayjs/plugin/relativeTime";
import duration from "dayjs/plugin/duration";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { toast } from "react-toastify";

dayjs.extend(UTC);
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

// Including min, excluding max
export function getRandomValue(min = 0, max = 1) {
  return Math.floor(Math.random() * (max - min) + 1) + Math.floor(min);
}

export function getUnixDateInUTC(date: number) {
  return dayjs.unix(date).utc();
}

export function getTodayInUTC() {
  return dayjs().utc().format("DD-MM-YYYY");
}

export function formatDate(date: dayjs.ConfigType, format: string) {
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

type FunctionArguments<T> = T extends (...args: infer F) => unknown ? F : never;

export function debounceFn<T extends Function>(fn: T, delay: number) {
  let timer: NodeJS.Timeout;
  return function (...params: FunctionArguments<T>) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...params);
    }, delay);
  };
}

export const throttleFn = <T extends Function>(fn: T, delay: number) => {
  let lastCall = 0;
  return function (...params: FunctionArguments<T>) {
    const now = Date.now();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return fn(...params);
  };
};

export const debouncedToast = debounceFn(toast, 500);

export const throttledToast = throttleFn(toast, 500);
