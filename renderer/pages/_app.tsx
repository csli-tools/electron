import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { wrapper } from '../store/';

const WrappedApp: React.FC<AppProps>  = ({Component, pageProps}) => {
  return <Component {...pageProps} />
}

export default wrapper.withRedux(WrappedApp)