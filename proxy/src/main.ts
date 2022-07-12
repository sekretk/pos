import * as http from 'http';
import { IncomingMessage, ServerResponse } from 'http';
import { exit } from 'process';

if (process.argv.includes('-help')) {
    console.log('Available params sequence: incomming port, outcoming destination URL, outcoming port');
    exit(0);
}

const port = Number(process.argv[2]);
const destination = String(process.argv[3]);
const dest_port = Number(process.argv[4]);

async function onRequest(req: IncomingMessage, client_res: ServerResponse) {

    const buffers = [];

    for await (const chunk of req) {
        buffers.push(chunk);
    }

    const data = Buffer.concat(buffers).toString();

    console.log(new Date().toLocaleString(), 'HANDLED', req.url, req.headers, data);

    const options = {
        hostname: destination,
        port: dest_port,
        path: req.url,
        method: req.method,
        headers: req.headers,
        data
    };

    const proxy = http.request(options, function (res) {
        client_res.writeHead(res.statusCode ?? 500, res.headers)
        res.pipe(client_res, {
            end: true
        });
    });

    req.pipe(proxy, {
        end: true
    });
}

http.createServer(onRequest).listen(port);

console.log('Proxy started on ', port, 'to', destination, ':', dest_port);