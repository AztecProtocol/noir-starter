import "./App.css";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

export default function MyApp({ Component, pageProps }) {
  return (<>
    <Component {...pageProps} />
    <ToastContainer />
  </>)
}
