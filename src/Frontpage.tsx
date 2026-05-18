import { useEffect, useState } from 'react';
import SimpleBar from 'simplebar-react';
import merch1 from './assets/merch/merch1.png';
import merch2 from './assets/merch/merch2.png';
import merch3 from './assets/merch/merch3.png';
import merch4 from './assets/merch/merch4.png';
import { listVods } from './utils/archive-client';
import type { VodData } from './utils/archive-client';
import CustomLink from './utils/CustomLink';
import Footer from './utils/Footer';
import { useMediaQuery } from './utils/useMediaQuery';
import Vod from './vods/Vod';

const merchImages = [merch1, merch2, merch3, merch4];

export default function Frontpage() {
  const isMobile = useMediaQuery('(max-width: 800px)');
  const [vods, setVods] = useState<VodData[]>([]);

  useEffect(() => {
    listVods({ limit: 10, sort: 'created_at', order: 'desc' })
      .then((response: { data: VodData[]; meta: { total: number } }) => {
        setVods(response.data.filter((vod: VodData) => vod.vod_uploads.length !== 0).slice(0, 3));
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
            <div className="bg-dark-light border border-gray-700 rounded p-2">
              <div className="flex flex-wrap justify-center mb-2">
                <h6 className="text-primary font-semibold">Merch</h6>
              </div>
              <div className="flex flex-nowrap gap-1">
                {merchImages.map((src, i) => (
                  <div key={i} className="overflow-hidden relative hover:shadow-[0_0_8px_#fff] transition-shadow">
                    <img alt="" src={src} className="h-full w-full" />
                  </div>
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
              title="Player"
              width="100%"
              height="160"
              scrolling="no"
              frameBorder="0"
              allow="autoplay"
              src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/910917202&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"
            />
          </div>
        </div>
      </div>
      <Footer />
    </SimpleBar>
  );
}
