export default defineEventHandler(() => {
    return {
        hasApiKey: !!process.env.BEDS24_API_KEY,
        propertyId: process.env.BEDS24_PROPERTY_ID,
        hasWebhookSecret: !!process.env.WEBHOOK_SECRET
    }
})
