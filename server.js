import { WebSocketServer } from 'ws'
import fs from 'node:fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const wss = new WebSocketServer({ port: 6969 })

wss.on('connection', function connection(ws) {
    ws.on('error', console.error)

    // watch file
    let watchedFilePath = __dirname + '/top.txt'
    fs.watchFile(watchedFilePath, { persistent: true, interval: 250 }, () => {
        fs.readFile(watchedFilePath, (err, data) => {
            if (err) throw err
            ws.send(data)
        })
    })
});