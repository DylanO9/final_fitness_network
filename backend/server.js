require('dotenv').config();
const app = require('./src/app');
const http = require('http');
const initializeSocketIO = require('./src/socket');

const server = http.createServer(app);
const io = initializeSocketIO(server);

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});