import { useEffect, useState } from 'react';
import SimpleBar from 'simplebar-react';
import { listVods, getChaptersLibrary } from './utils/archive-client';
import type { VodData, LibraryChapterItem } from './utils/archive-client';
import CustomLink from './utils/CustomLink';
import Footer from './utils/Footer';
import { useMediaQuery } from './utils/useMediaQuery';
import Vod from './vods/Vod';
import GameCard from './library/GameCard';

export default function Frontpage() {
  const isMobile = useMediaQuery('(max-width: 800px)');
  const [vods, setVods] = useState<VodData[]>([]);
  const [games, setGames] = useState<LibraryChapterItem[]>([]);

  useEffect(() => {
    listVods({ limit: 10, sort: 'created_at', order: 'desc' })
      .then((response: { data: VodData[]; meta: { total: number } }) => {
        setVods(response.data.filter((vod: VodData) => vod.vod_uploads.length !== 0).slice(0, 3));
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    getChaptersLibrary({ sort: 'count', order: 'desc', limit: 6 })
      .then((response: { data: LibraryChapterItem[]; meta: { total: number } }) => {
        setGames(response.data);
      })
      .catch(console.error);
  }, []);

  if (vods.length === 0) return null;

  const vodsToUse = isMobile ? vods.slice(0, 2) : vods.slice(0, 3);

  return (
    <SimpleBar className="min-h-0 h-full w-full">
      <div className="p-2 md:p-4">
        <div className="flex justify-center w-full">
          <div className={`flex flex-col ${isMobile ? 'w-full' : 'w-1/2'}`}>
            <div className="bg-dark-light border border-gray-700 rounded p-2 mt-1 w-full">
              <div className="flex flex-wrap justify-center mb-3">
                <CustomLink href="/vods">
                  <h6 className="text-primary font-semibold hover:underline cursor-pointer">Recent Vods</h6>
                </CustomLink>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 justify-center">
                {vodsToUse.map((vod: VodData) => (
                  <Vod key={vod.id} vod={vod} isMobile={isMobile} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-2 md:p-4">
        <div className="flex justify-center w-full">
          <div className={`flex flex-col ${isMobile ? 'w-full' : 'w-1/2'}`}>
            <div className="bg-dark-light border border-gray-700 rounded p-2 w-full">
              <div className="flex flex-wrap justify-center mb-3">
                <CustomLink href="/vods?sort=count">
                  <h6 className="text-primary font-semibold hover:underline cursor-pointer">Most Played Games</h6>
                </CustomLink>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-2 justify-center">
                {games.map((game: LibraryChapterItem) => (
                  <GameCard key={game.game_id} game_id={game.game_id} name={game.name} image={game.image} count={game.count} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-2 md:p-4">
        <div className="flex justify-center w-full">
          <div className={`flex flex-col ${isMobile ? 'w-full' : 'w-1/2'}`}>
            <iframe
              data-testid="embed-iframe"
              style={{ borderRadius: '12px' }}
              src="https://open.spotify.com/embed/artist/0b6qCdAWpAMUYdLQLbmOip?utm_source=generator&si=0a802c103dd8470f"
              width="100%"
              height="450"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          </div>
        </div>
      </div>
      <Footer />
    </SimpleBar>
  );
}
