"use strict";

const cpuSection = document.getElementById('cpuSection');
const ramSection = document.getElementById('ramSection');
const CHART_LIMIT = 200;

let cpuLabels = [];
let cpuData = [];
let cpuInstance = [];
let ramLabels = [];
let ramData = [];
let ramInstance;

const createCpuChart = (cpu) => {

    // update card
    document.getElementById('cpuCard').innerText = (100 - parseFloat(cpu[0].idle)).toFixed(2) + ' %';

    // create canvas element
    for (let i = 0; i < cpu.length; i++) {

        // generate id
        let canvasId = (i === 0) ? 'allCpu' : `cpu${i}`;

        // create container
        let container = document.createElement('div');
        container.setAttribute('id', `${canvasId}Container`);
        container.classList.add('cpu-chart-container');

        if (i === 0) {
            document.getElementById('allCpuContainer').append(container);
        } else {
            document.getElementById('singularCpuContainer').append(container);
        }
        
        // create canvas
        let canvas = document.createElement('canvas');
        canvas.setAttribute('id', canvasId);
        container.append(canvas);

        // create array
        cpuLabels[i] = [];
        cpuData[i] = [];

        // process data
        let date = new Date();
        let usage = (100 - parseFloat(cpu[i].idle)).toFixed(2);
        let label = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        
        // push to array
        cpuData[i].push(usage);
        cpuLabels[i].push(label);

        // create configuratins
        let config = {
            type: 'line',
            data: {
                labels: cpuLabels[i],
                datasets: [{
                    label: (i === 0) ? 'ALL CPU USAGE (%)' : `CPU ${cpu[i].cpu} USAGE (%)`,
                    data: cpuData[i],
                    borderColor: 'rgb(75, 192, 192)',
                    fill: true,
                    tension: 0.1
                }]
            },
            options: {
                scales: {
                    y: {
                        min: 0,
                        max: 100,
                    },
                    x: {  
                        grid: {
                            display: false
                        },
                        ticks:{
                            display: false
                        }         
                    }
                }
            }
        };
    
        // create chart
        cpuInstance.push(new Chart(document.getElementById(canvasId), config));
    };
}

const updateCpuChart = (cpu) => {

    // update card
    document.getElementById('cpuCard').innerText = (100 - parseFloat(cpu[0].idle)).toFixed(2) + ' %';

    // create canvas element
    for (let i = 0; i < cpu.length; i++) {
        // process data
        let date = new Date();
        let usage = (100 - parseFloat(cpu[i].idle)).toFixed(2);
        let label = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        
        // push to data array
        cpuData[i].push(usage);
        cpuLabels[i].push(label);

        // set data limit
        if (cpuInstance[i].data.datasets[0].data.length >= CHART_LIMIT) {
            cpuInstance[i].data.datasets[0].data.shift();
            cpuInstance[i].data.labels.shift();
        }

        // push new
        cpuInstance[i].data.datasets[0].data.push(usage);
        cpuInstance[i].data.labels.push(label);
        cpuInstance[i].update('none');
    }
}

const createRamChart = (totalRam, usedRam) => {

    // update card
    document.getElementById('ramCard').innerText = parseFloat(usedRam / totalRam * 100).toFixed(2) + ' %';

    // generate id
    let canvasId = 'ramCanvas';

    // create container
    let container = document.createElement('div');
    container.setAttribute('id', `${canvasId}Container`);
    container.classList.add('ram-chart-container');
    ramSection.append(container);
    
    // create canvas
    let canvas = document.createElement('canvas');
    canvas.setAttribute('id', canvasId);
    container.append(canvas);

    // process data
    let date = new Date();
    let usage = parseFloat(usedRam / totalRam * 100).toFixed(2);
    let label = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    
    // push to array
    ramData.push(usage);
    ramLabels.push(label);

    // create configuratins
    let config = {
        type: 'line',
        data: {
            labels: ramLabels,
            datasets: [{
                label: 'RAM USAGE (%)',
                data: ramData,
                borderColor: 'rgb(59, 200, 144)',
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            scales: {
                y: {
                    min: 0,
                    max: 100,
                },
                x: { 
                    grid: {
                        display: false
                    },
                    ticks:{
                        display: false
                    }         
                }
            }
        }
    };

    // create chart
    ramInstance = new Chart(document.getElementById(canvasId), config);
}

const updateRamChart = (totalRam, usedRam) => {
    
    // update card
    document.getElementById('ramCard').innerText = parseFloat(usedRam / totalRam * 100).toFixed(2) + ' %';

    // process data
    let date = new Date();
    let usage = parseFloat(usedRam / totalRam * 100).toFixed(2);
    let label = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    
    // push to array
    ramData.push(usage);
    ramLabels.push(label);

    // set data limit
    if (ramInstance.data.datasets[0].data.length >= CHART_LIMIT) {
        ramInstance.data.datasets[0].data.shift();
        ramInstance.data.labels.shift();
    }

    // push new
    ramInstance.data.datasets[0].data.push(usage);
    ramInstance.data.labels.push(label);
    ramInstance.update('none');
}

const wsHost = 'ws://192.168.2.192:6969';
const rcTimeout = 2000;
let cpuUpdateBusy = false;
let ramUpdateBusy = false;
const wsConnect = () => {

    try {
        let ws = new WebSocket(wsHost);

        ws.onopen = () => {
            console.log('Websocket connected');
        };

        ws.onmessage = (event) => {
            if (event.data instanceof Blob) {
                event.data.text()
                    .then((res) => {
                        if (res.length > 0) {
                            try {
                                let log = JSON.parse(res);
                                let cpu = log.sysstat.hosts[0].statistics[0]['cpu-load'];
                                
                                // prevent double update
                                if (cpuInstance.length < 1) {
                                    if (!cpuUpdateBusy) {
                                        cpuUpdateBusy = setTimeout(() => {
                                            createCpuChart(cpu);
                                            clearTimeout(cpuUpdateBusy);
                                            cpuUpdateBusy = false;
                                        }, 500)
                                    }
                                } else {
                                    if (!cpuUpdateBusy) {
                                        cpuUpdateBusy = setTimeout(() => {
                                            updateCpuChart(cpu);
                                            clearTimeout(cpuUpdateBusy);
                                            cpuUpdateBusy = false;
                                        }, 500)
                                    }
                                }
                            } catch (e) {
                                let log = res.split(" ");
                                if (log[0] === 'total') {
                                    
                                    if (typeof ramInstance === 'undefined') {
                                        if (!ramUpdateBusy) {
                                            ramUpdateBusy = setTimeout(() => {
                                                createRamChart(log[7], log[8]);
                                                clearTimeout(ramUpdateBusy);
                                                ramUpdateBusy = false;
                                            }, 500)
                                        }
                                    } else {
                                        if (!ramUpdateBusy) {
                                            ramUpdateBusy = setTimeout(() => {
                                                updateRamChart(log[7], log[8]);
                                                clearTimeout(ramUpdateBusy);
                                                ramUpdateBusy = false;
                                            }, 500)
                                        }
                                    }
                                }
                            }
                        }
                    })
            } else {
                console.log(event.data);
            }
        }

        ws.onclose = () => {
            ws.close();
            console.log('Failed to open connection, trying to connect again...');

            // create new instance
            ws = wsConnect();
        }

        return ws;

    } catch (err) {
        return (typeof ws !== 'undefined') ? ws.close() : false;
    }
};

// connect
let ws = wsConnect();

// const ctx = document.getElementById('cpuChart');
// let cpuChart = new Chart(ctx, config)