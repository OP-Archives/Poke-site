declare module '*.jpg' {
  const src: string;
  export default src;
}
declare module '*.jpeg' {
  const src: string;
  export default src;
}
declare module '*.png' {
  const src: string;
  export default src;
}
declare module '*.gif' {
  const src: string;
  export default src;
}
declare module '*.svg' {
  const src: string;
  export default src;
}
declare module '*.avif' {
  const src: string;
  export default src;
}
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}
declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}
declare module '*.css';

declare const __GIT_HASH__: string;

interface ViteEnv {
  VITE_CHANNEL: string;
  VITE_ARCHIVE_API_BASE: string;
  VITE_START_DATE: string;
  VITE_GITHUB: string;
  VITE_DOMAIN: string;
  VITE_DEFAULT_DELAY: string;
  VITE_TWITCH_ID: string;
  VITE_CONTESTS_API: string;
  VITE_CONTESTS_SOCKETIO_HOST: string;
  VITE_CONTESTS_SOCKETIO_PATH: string;
}

interface ImportMeta {
  readonly env: ViteEnv;
}

interface Window {
  __GIT_HASH__: string;
}
