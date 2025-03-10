import { useNavigate } from 'react-router-dom';

export function useAnimatedNavigate() {
  const navigate = useNavigate();

  return (path: string) => {
    const appDiv = document.getElementById('app-content')!;
    appDiv.classList.add('closing');

    setTimeout(() => {
      appDiv.classList.remove('closing');
      appDiv.classList.add('opening');
      navigate(path);

      setTimeout(() => {
        appDiv.classList.remove('opening');
      }, 250);
    }, 250);
  };
}
