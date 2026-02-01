export default defineEventHandler(() => {
    return {
        hasApiKey: !!process.env.BEDS24_API_KEY,
        propertyId: process.env.BEDS24_PROPERTY_ID,
        hasPropKey: !!process.env.BEDS24_PROP_KEY,
        hasWebhookSecret: !!process.env.WEBHOOK_SECRET
    }
})
