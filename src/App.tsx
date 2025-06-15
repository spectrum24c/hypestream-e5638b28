
import * as React from 'react';
import SplashScreen from '@/components/SplashScreen';
import MainApp from '@/components/MainApp';
import './App.css';

function App() {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return loading ? <SplashScreen /> : <MainApp />;
}

export default App;
