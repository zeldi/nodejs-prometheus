const express = require('express')
const app = express()
const port = 3000

// Register promitheus-client
const client =  require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;
// Probe every 5th second.
collectDefaultMetrics({ timeout: 5000 });

const counter = new client.Counter({
    name: 'node_request_operation_total',
    help: 'The total number of processed requests'
})


const histogram = new client.Histogram({
    name: 'node_request_duration_seconds',
    help: 'Histogram for the duration in seconds.',
    bucket: [1,2,5,6,10]
})

app.use(require('express-status-monitor')())

app.get('/', (req, res) => {
    var start = new Date()
    var simulateTime = 1000

    setTimeout(function(argument) {
        var end = new Date() - start
        histogram.observe(end / 1000); //convert to seconds
    }, simulateTime)

    counter.inc();

    res.send('Hello Openshift-v4')
})


app.get('/metrics', (req, res) => {
    res.set('Content-Type', client.register.contentType)
    res.end(client.register.metrics())
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))



/*
 Two main things the prometheus normally used for:
 1. How long a function/operation takes
 2. How many time does it occurs

 We gonna use two main prometheus metrics:
 1. Prometheus Counter
 2. Prometheus Histogram
 */
