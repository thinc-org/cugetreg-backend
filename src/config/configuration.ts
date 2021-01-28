export default () => ({
	mongoURI: process.env.MONGO_URI || 'http://localhost:27017/cugetreg',
	port: parseInt(process.env.PORT, 10) || 3000,
})
