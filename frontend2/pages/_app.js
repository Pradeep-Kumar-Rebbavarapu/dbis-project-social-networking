import Navbar from '@/components/Navbar'
import '@/styles/globals.css'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useRef } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import toast, { Toaster } from 'react-hot-toast';
import { ContextProvider } from '@/Context/context'
const queryClient = new QueryClient()


export default function App({ Component, pageProps }) {
  
  return (
    <div className=''>
      <ContextProvider >
      <QueryClientProvider client={queryClient}>
        
          <div className='z-[10] invert'>
            <Navbar />
            <Toaster />
          </div>
          <Component {...pageProps}  />
          <ReactQueryDevtools initialIsOpen={false} />
        
      </QueryClientProvider >
      </ContextProvider>
    </div>

  )
}
