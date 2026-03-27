const SESSION_MAX_AGE_SECONDS = 60 * 60; // 1 hour

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge: SESSION_MAX_AGE_SECONDS, // 1 hour in seconds
    },
    callbacks: {
        async jwt({ token, user }) {
            // On initial sign-in, stamp the user data and expiry time
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.universityId = user.universityId;
                token.universityEmail = user.universityEmail;
                token.name = user.name;
                token.tokenExpiry = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;
            }

            // On every subsequent request, check if the token has expired
            const now = Math.floor(Date.now() / 1000);
            if (token.tokenExpiry && now > token.tokenExpiry) {
                // Return null to invalidate the session — user will be redirected to login
                return null;
            }

            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.universityId = token.universityId;
                session.user.universityEmail = token.universityEmail;
                session.user.name = token.name;
                // Expose expiry to the client so the UI can warn the user
                session.tokenExpiry = token.tokenExpiry;
            }
            return session;
        },
    },
    providers: [], // Empty for now, will be filled in auth.js
};
