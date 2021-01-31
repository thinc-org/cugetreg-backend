export default () => ({
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/cugetreg',
  port: parseInt(process.env.PORT, 10) || 3000,
  googleOAuthId: process.env.GOOGLE_OAUTH_ID,
  googleOAuthSecret: process.env.GOOGLE_OAUTH_SECRET,
  jwtSecret: process.env.JWT_SECRET,
})
