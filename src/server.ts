import http from 'http';
import app from './app';

const port: Number = parseInt(process.env.PORT || '3000', 10);
app.set('port', port);

// Create http server
const server = http.createServer(app);

server.listen(port, () => console.log('Listening on port ' + port));
