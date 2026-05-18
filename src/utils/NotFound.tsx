import { useEffect } from 'react';
import Logo from '../assets/jammin.gif';
import CustomLink from './CustomLink';

export default function NotFound({ channel }: { channel: string }) {
  useEffect(() => {
    document.title = `Not Found - ${channel}`;
  }, [channel]);

  return (
    <div className="flex flex-col justify-center items-center h-full w-full">
      <img src={Logo} alt="" style={{ height: 'auto', maxWidth: '200px' }} />
      <div className="flex justify-center mt-4">
        <CustomLink href="/" className="text-gray-400 hover:opacity-50 transition-opacity">
          Nothing over here..
        </CustomLink>
      </div>
    </div>
  );
}
