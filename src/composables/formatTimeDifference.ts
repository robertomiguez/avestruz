export const formatTimeDifference = (unixTimestamp: number) => {
  const now = Date.now() / 1000; // Convert milliseconds to seconds
  const secondsAgo = now - unixTimestamp;

  if (secondsAgo < 60) return secondsAgo.toFixed(0) + 's';
  if (secondsAgo < 3600) return Math.floor(secondsAgo / 60) + 'm';
  if (secondsAgo < 86400) return Math.floor(secondsAgo / 3600) + 'h';
  if (secondsAgo < 604800) return Math.floor(secondsAgo / 86400) + 'd';
  else return Math.floor(secondsAgo / 604800) + 'w';
};
