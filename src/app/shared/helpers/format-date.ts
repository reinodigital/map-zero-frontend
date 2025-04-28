export const formatDateToString = (date: Date): string => {
  const pad = (num: number): string => (num < 10 ? '0' + num : num.toString());

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1); // Months are zero-based
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// Format as YYYY-MM-DDTHH:mm
export const formatDateForInput = (
  date: Date | string | null
): string | null => {
  if (!date) return null;

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString().slice(0, 16); // Remove seconds & timezone
};
