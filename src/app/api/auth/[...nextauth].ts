import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import {PrismaClient} from '@prisma/client';
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const handler = NextAuth({
    providers: [
       CredentialsProvider({
        name: 'Credentials',
        credentials: {
            email: { label: "email", type: "email", placeholder: "example@example.com" },
            password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
            if(!credentials) return null;

            const user = await prisma.user.findUnique({
                where: {
                    email: credentials.email
                }
            })

            if(user) {
                const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
                if(isPasswordCorrect) {
                    return {
                        username: user.name,
                        email: user.email,
                        id: user.id.toString()
                    }
                }else{
                    return null;
                }
            }else{
                return null;
            }
          }
       }) 
    ],
    secret: process.env.SECRET_KEY,
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.name = user.username;
                token.email = user.email;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user = {
                    id: token.id,
                    username: token.name,
                    email: token.email
                }
            }
            return session;
        }
    }
})

export { handler as GET, handler as POST }