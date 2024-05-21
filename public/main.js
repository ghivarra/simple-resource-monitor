const wsHost = 'ws://192.168.2.192:6969'
const rcTimeout = 2000
const wsConnect = () => {

    try {
        let ws = new WebSocket(wsHost)

        ws.onopen = (event) => {
            console.log('Websocket connected');
        }

        ws.onmessage = (event) => {
            if (event.data instanceof Blob) {
                event.data.text()
                    .then((res) => {
                        if (res.length > 0) {
                            try {
                                let log = JSON.parse(res)
                                let cpu = log.sysstat.hosts[0].statistics[0]['cpu-load']
                                
                                console.log(cpu)

                                // count all cpu usage
                                let all = (100 - parseFloat(cpu[0].idle)).toFixed(2)
                                console.log(`ALL CPU USAGE: ${all}%`)

                                // count each cpu usage
                                for (let n = 0; n < cpu.length; n++) {
                                    if (n > 0) {
                                        const item = cpu[n];
                                        const calc = (100 - parseFloat(item.idle)).toFixed(2)
                                        console.log(`CPU ${item.cpu} Usage: ${calc}%`)
                                    }
                                }

                            } catch (e) {
                                let log = res.split(" ")
                                console.log(`Total: ${log[7]} mb`)
                                console.log(`Used: ${log[8]} mb`)
                                console.log(`Free: ${log[9]} mb`)
                            }
                        }
                    })
            } else {
                console.log(event.data)
            }
        }

        ws.onclose = (event) => {
            ws.close()
            console.log('Failed to open connection, trying to connect again...')

            // create new instance
            ws = wsConnect()
        }

        return ws
    } catch (err) {
        return (typeof ws !== 'undefined') ? ws.close() : false
    }
}

// connect
let ws = wsConnect();