import { Video, BookOpen, AlertCircle, Trophy } from 'lucide-react';
import { RedditIcon, TwitterIcon, YouTubeIcon, TwitchIcon, SoundcloudIcon } from '../assets/icons';
import CustomLink from '../utils/CustomLink';
import { useMediaQuery } from '../utils/useMediaQuery';
import Drawer from './drawer';

const socials = [
  { path: `https://reddit.com/r/pokelawls`, icon: <RedditIcon className="text-primary" /> },
  { path: `https://youtube.com/c/pokelawls`, icon: <YouTubeIcon className="text-primary" /> },
  { path: `https://soundcloud.com/pokelawls`, icon: <SoundcloudIcon className="text-primary" /> },
  { path: `https://twitter.com/pokelawls`, icon: <TwitterIcon className="text-primary" /> },
  { path: `https://twitch.tv/pokelawls`, icon: <TwitchIcon className="text-primary" /> },
];

export default function Navbar() {
  const isMobile = useMediaQuery('(max-width: 800px)');

  return (
    <div className="flex-1">
      <header className="bg-dark-light shadow-lg">
        <div className="flex items-center px-4 py-2">
          <div className="flex items-center flex-1">
            {isMobile && <Drawer socials={socials} />}

            <div className="mr-2">
              <CustomLink href="/">
                <img alt="" style={{ maxWidth: '45px', height: 'auto' }} src="/loading.gif" />
              </CustomLink>
            </div>

            <span className="mr-1 text-lg">
              <CustomLink color="inherit" href="/">
                <span className="text-primary font-semibold">Poke</span>
              </CustomLink>
            </span>

            {!isMobile && (
              <>
                <hr className="h-6 border-l border-gray-600 mx-2" />

                {socials.map(({ path, icon }) => (
                  <div key={path} className="mr-2">
                    <CustomLink href={path}>{icon}</CustomLink>
                  </div>
                ))}
              </>
            )}
          </div>

          {!isMobile && (
            <div className="flex items-center justify-center flex-1">
              <div className="mr-2">
                <CustomLink href="/contests">
                  <div className="flex justify-center items-center gap-1">
                    <Trophy className="text-primary mr-0.5" size={24} />
                    <span className="text-primary font-semibold text-lg">Contests</span>
                  </div>
                </CustomLink>
              </div>
              <div className="mr-2">
                <CustomLink href="/vods">
                  <div className="flex justify-center items-center gap-1">
                    <Video className="text-primary mr-0.5" size={24} />
                    <span className="text-primary font-semibold text-lg">Vods</span>
                  </div>
                </CustomLink>
              </div>
              <div className="mr-2">
                <CustomLink href="/library">
                  <div className="flex justify-center items-center gap-1">
                    <BookOpen className="text-primary mr-0.5" size={24} />
                    <span className="text-primary font-semibold text-lg">Library</span>
                  </div>
                </CustomLink>
              </div>
            </div>
          )}

          {!isMobile && (
            <div className="flex justify-end flex-1">
              <div className="mr-2">
                <CustomLink href={`${import.meta.env.VITE_GITHUB}/issues`}>
                  <div className="flex justify-center items-center gap-1">
                    <AlertCircle className="text-primary mr-0.5" size={24} />
                    <span className="text-primary font-semibold text-lg">Issues</span>
                  </div>
                </CustomLink>
              </div>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}
