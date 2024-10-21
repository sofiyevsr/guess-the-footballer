interface MonthRangeInput {
	year: number;
	month: number;
}

export function getMonthRange({ year, month }: MonthRangeInput) {
	const startOfMonth = new Date(year, month, 1);
	const endOfMonth = new Date(year, month + 1, 1);
	return [startOfMonth, endOfMonth] as const;
}
