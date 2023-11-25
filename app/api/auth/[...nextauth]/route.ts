import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import LinkedInProvider from "next-auth/providers/linkedin";
import AzureADProvider from "next-auth/providers/azure-ad";

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
        AzureADProvider({
         clientId: process.env.AZURE_AD_CLIENT_ID??"",
         clientSecret: process.env.AZURE_AD_CLIENT_SECRET??"",
         authorization: {
            params: { scope: 'openid email profile User.Read offline_access Calendars.ReadWrite' },
          },
          httpOptions: { timeout: 10000 },
         // tenantId: process.env.AZURE_AD_TENANT_ID??"",
       }),
    ],
    callbacks: {
      async jwt({ token, user, account }) {
         if (account && user) {
           return {
             accessToken: account.access_token,
             accessTokenExpires: account?.expires_at
               ? account.expires_at * 1000
               : 0,
             refreshToken: account.refresh_token,
             user,
           };
         }
         return token;
       },
       async session({ session, token }) {
         if (session) {
           session.user = token.user as any;
           session.accessToken = token.accessToken as any;
         }
         return session;
       },
    },
});


export {handler as GET , handler as POST}