import { useNavigate } from 'react-router-dom';

interface RedirectProps {
  to: string;
}

export default function Redirect({ to }: RedirectProps) {
  const navigate = useNavigate();
  navigate(to, { replace: true });
  return null;
}
