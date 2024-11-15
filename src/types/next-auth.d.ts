import "next-auth"

declare module 'next-auth' {
    interface User {
        userId?: string,
        username?: string
    }
    interface Session {
        user: {
            userId?: string,
            username?: string,
            email?: string
        } & DefaultSession['user']
    }
}