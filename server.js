import { WebSocketServer } from 'ws'
import fs from 'node:fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const wss = new WebSocketServer({ port: 6969 })

wss.on('connection', function connection(ws) {
    ws.on('error', console.error)

    // watch cpu file
    let cpuFilePath = __dirname + '/cpu.json'
    let ramFilePath = __dirname + '/memory.txt'

    fs.watchFile(cpuFilePath, { persistent: true, interval: 250 }, () => {
        fs.readFile(cpuFilePath, (err, data) => {
            if (err) throw err
            ws.send(data)
        })
    })

    // watch memory file
    fs.watchFile(ramFilePath, { persistent: true, interval: 250 }, () => {
        fs.readFile(ramFilePath, (err, data) => {
            if (err) throw err
            ws.send(data)
        })
    })
});