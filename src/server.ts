import http from 'http';
import app from './app';

const port = 3000;
app.set('port', port);

// Create http server
const server = http.createServer(app);

server.listen(port);

console.log('Listening on port ' + port);
