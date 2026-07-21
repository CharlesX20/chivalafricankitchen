'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'

export function ChatbotScript() {
  const pathname = usePathname()
  
  // ONLY render on the exact home page
  if (pathname !== '/') {
    return null
  }

  return (
    <Script
      src="https://pocketreply.tech/embed.js"
      strategy="lazyOnload"
      data-agent-id="93dfe804-f398-48e1-8062-2349963ecce"
      data-base-url="https://pocketreply.tech"
      id="pocketreply-chatbot"
    />
  )
}