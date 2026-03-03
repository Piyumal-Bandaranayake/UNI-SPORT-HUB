export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.universityId = user.universityId;
                token.name = user.name;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.universityId = token.universityId;
                session.user.name = token.name;
            }
            return session;
        },
    },
    providers: [], // Empty for now, will be filled in auth.js
};
