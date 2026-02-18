export const urls = {
    base: '/',
    public: 'https://launchmvpfast.com',
    app: {
        relay: {
            signup: 'https://saas.launchmvpfast.com/auth/signup',
            dashboard: 'https://saas.launchmvpfast.com',
        },
        components: '/components',
        starterkits: {
            base: '/open-source-starterkits',
            saasNextjs: {
                base: '/open-source-starterkits/open-source-nextjs-saas-starterkit',
                preview: 'https://saas.launchmvpfast.com',
            },
            orbit: {
                preview: 'https://orbit.launchmvpfast.com',
            },
        },
        blocks: '/blocks',
        pricing: '/pricing',
        earlyAccess: '/early-access',
        blocksView: '/blocks-view',
    },
    docs: {
        base: '/docs',
    },
    socials: {
        gh: 'https://github.com/alifarooq9/launchmvpfast',
        suggestions:
            'https://github.com/alifarooq9/launchmvpfast/discussions/categories/suggestions',
        x: 'https://x.com/AliFarooqDev',
        ali: 'https://x.com/AliFarooqDev',
    },
} as const
