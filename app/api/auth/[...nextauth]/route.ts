import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import LinkedInProvider from "next-auth/providers/linkedin";

const handler = NextAuth({
    providers:[
        GoogleProvider({
           clientId:process.env.GOOGLE_CLIENT_ID??"",
           clientSecret:process.env.GOOGLE_CLIENT_SECRET??"",
        }),
        FacebookProvider({
           clientId:process.env.FACEBOOK_CLIENT_ID??"",
           clientSecret:process.env.FACEBOOK_CLIENT_SECRET??"",
        }),
        LinkedInProvider({
           clientId:process.env.LINKEDIN_CLIENT_ID??"",
           clientSecret:process.env.LINKEDIN_CLIENT_SECRET??"",
        }),
    ],
});


export {handler as GET , handler as POST}