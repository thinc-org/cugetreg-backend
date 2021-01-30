export default () => ({
	mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/cugetreg',
	port: parseInt(process.env.PORT, 10) || 3000,
	oauthClientId: process.env.OAUTH_CLIENT_ID,
	oauthClientSecret: process.env.OAUTH_CLIENT_SECRET,
	jwtSecret: process.env.JWT_SECRET,
})
