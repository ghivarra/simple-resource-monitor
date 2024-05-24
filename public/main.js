"use strict";

const cpuSection = document.getElementById('cpuSection');
const ramSection = document.getElementById('ramSection');
const CHART_LIMIT = 100;

var cpuLabels = [];
var cpuData = [];
var cpuInstance = [];
var ramLabels = [];
var ramData = [];
var ramInstance;

const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

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

const wsHost = 'wss://monitor.test:8443';
const rcTimeout = 2000;
var cpuUpdateBusy = 0;
var ramUpdateBusy = 0;
const wsConnect = () => {

    try {
        var ws = new WebSocket(wsHost);

        ws.onopen = () => {
            console.log('Websocket connected');
        };

        ws.onmessage = (event) => {
            let res = event.data
            if (res.length > 0) {
                try {
                    let log = JSON.parse(res);
                    if (log.title === 'cpu') {
                        let logData = JSON.parse(log.data);
                        if (cpuInstance.length < 1) {
                            createCpuChart(logData.sysstat.hosts[0].statistics[0]['cpu-load']);
                        } else {
                            updateCpuChart(logData.sysstat.hosts[0].statistics[0]['cpu-load']);
                        }
                    } else if (log.title === 'ram') {
                        let logData = log.data.split(" ");
                        if (typeof ramInstance === 'undefined') {
                            createRamChart(logData[7], logData[8]);
                        } else {
                            updateRamChart(logData[7], logData[8]);
                        }
                    }
                } catch (e) {
                    console.warn('Failed to parse data: ' + e);
                }
                    
            }
        }

        ws.onclose = () => {
            console.log('Failed to open connection, trying to connect again...');
            ws.close();

            // create
            sleep(rcTimeout).then(() => {
                ws = wsConnect();
            });
            
        }

        return ws;

    } catch (err) {
        return (typeof ws !== 'undefined') ? ws.close() : false;
    }
};

// connect
let ws = wsConnect();