import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

interface FacebookConfig {
    pageToken: string
    pageId: string
}

interface Config {
    facebook: FacebookConfig
}

// Configuration object for Facebook
export const config: Config = {
    facebook: {
        pageToken: process.env.FB_PAGE_TOKEN || 'EAARpCJUxuXABPMnCCoNQwqPIwDR2qKSJsnScv5HE2pvXWNW2EZAVekFFx8880ZCteFFynNXVXr1XPF5Kbn3VsDZAd9BYrZA1TZAwYSPBtFZCXBhANSpqda8yK2akRtVPmEwudRmswgiviCWYc6SeX2cY7ufAzIivzshFJlsr32kYdWTzMmt30fv88WV2fuwkIkwI1gPuKx',
        pageId: process.env.FB_PAGE_ID || '704633709403601',
    }
}

// Export individual config sections for convenience
export const { facebook } = config

export default config 