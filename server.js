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

    // send cpu and memory file
    fs.readFile(cpuFilePath, 'UTF-8', (err, data) => {
        if (err) throw err
        ws.send(JSON.stringify({
            title: 'cpu',
            data: data
        }))
    })

    fs.readFile(ramFilePath, 'UTF-8', (err, data) => {
        if (err) throw err
        ws.send(JSON.stringify({
            title: 'ram',
            data: data
        }))
    })

    // watch cpu file
    fs.watch(cpuFilePath, { encoding: 'UTF-8' }, () => {
        fs.readFile(cpuFilePath, 'UTF-8', (err, data) => {
            if (err) throw err
            ws.send(JSON.stringify({
                title: 'cpu',
                data: data
            }))
        })
    })

    // watch memory file
    fs.watch(ramFilePath, { encoding: 'UTF-8' }, () => {
        fs.readFile(ramFilePath, 'UTF-8', (err, data) => {
            if (err) throw err
            ws.send(JSON.stringify({
                title: 'ram',
                data: data
            }))
        })
    })
});