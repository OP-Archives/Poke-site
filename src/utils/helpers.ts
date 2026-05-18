export const toHMS = (secs: number | string) => {
  const sec_num = parseInt(String(secs), 10);
  const hours = Math.floor(sec_num / 3600);
  const minutes = Math.floor(sec_num / 60) % 60;
  const seconds = sec_num % 60;
  return `${hours}h${minutes}m${seconds}s`;
};

export const toHHMMSS = (secs: number | string) => {
  const sec_num = parseInt(String(secs), 10);
  const hours = Math.floor(sec_num / 3600);
  const minutes = Math.floor(sec_num / 60) % 60;
  const seconds = sec_num % 60;

  return [hours, minutes, seconds]
    .map((v: number) => (v < 10 ? '0' + v : String(v)))
    .filter((v, i) => v !== '00' || i > 0)
    .join(':');
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getImage = (link: string | undefined, width = 40, height = 53) => {
  if (!link) return 'https://static-cdn.jtvnw.net/ttv-static/404_boxart.jpg';
  return link.replace('{width}x{height}', `${width}x${height}`);
};
