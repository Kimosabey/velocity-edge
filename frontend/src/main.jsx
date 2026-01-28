import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MantineProvider } from '@mantine/core'
import '@mantine/core/styles.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MantineProvider
      theme={{
        primaryColor: 'gray',
        fontFamily: 'Outfit, system-ui, sans-serif',
        headings: {
          fontFamily: 'Outfit, system-ui, sans-serif',
        },
        colors: {
          // Custom color map matching the palette
          brand: ['#F4EEE0', '#E5DCC5', '#D6CAB0', '#6D5D6E', '#4F4557', '#393646', '#2A2833', '#1F1E26', '#15141A', '#0B0A0D'],
        },
      }}
    >
      <App />
    </MantineProvider>
  </StrictMode>,
)
