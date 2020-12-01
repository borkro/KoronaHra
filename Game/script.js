const DISPLAY_N_DAYS = 150;
const playSpeed = 350; // ms

const minSizeOfData = 150;

let dataDisplays = [];
let charts = [];

let playBool = false;

let simulation = null;


function addDataDisplay(name, chartDataset, maxDays) {
    dataDisplays.push({
        name: name,
        chartDataset: chartDataset,
        maxDays: maxDays
    });
}

function displayData(simDay) {
    // Display all new data
    dataDisplays.forEach(display => {
        let chartData = display.chartDataset.data;
        chartData.push(simDay[display.name]);
        if (chartData.length > display.maxDays) {
            chartData.shift();
        }
    });

    // Update all charts
    charts.forEach(chart => {
        let data = chart.data;
	    data.labels.push(simDay.date);
        if (data.labels.length > data.datasets[0].data.length) {
            data.labels.shift();
        }
	    chart.update();
    });

	document.getElementById("datum").innerHTML = simDay.date;
	document.getElementById("kumulativniUmrti").innerHTML = Math.round(simDay.kumulativniPocetUmrti);
	document.getElementById("dnesUmrti").innerHTML = Math.round(simDay.noveUmrti);
}

function copyWithDefault(dict, defaults) {
    // Hacky way to do clone
    let ret = JSON.parse(JSON.stringify(defaults));
    for (var key in dict) {
        ret[key] = dict[key];
    }

    return ret;
}

function createChart(canvasId, maxDays, datasets, yAxes) {
    let canvas = document.getElementById(canvasId);
    let canvasCtx = canvas.getContext("2d");

    let datasetDefault = {
			data: [],
			borderWidth: 2,
			lineTension: 0.4
	};

    let chartDatasets = [];
    datasets.forEach(dataset => {
        let d = copyWithDefault(dataset, datasetDefault);
        delete d.dataset;
        chartDatasets.push(d);
    });

    let chartYAxes = [];
    let yAxisDefault = {
		ticks: {
			beginAtZero: true//,
		}
    };

    yAxes.forEach(yAxis => {
        chartYAxes.push(copyWithDefault(yAxis, yAxisDefault));
    });
	let chart = new Chart(canvasCtx, {
		type: 'line',
		fill: 'start',
		data: {
		    labels: [],
		    datasets: chartDatasets
        },
		options: {
			layout: {
				padding: {
					left: 0,
					right: 0,
					top: 0,
					bottom: 0,
				}
			},
			scales: {
				yAxes: chartYAxes,
				xAxes: [{
					ticks: {
						autoskip: true/* ,
						maxRotation: 0 */
					}
				}]
			}
		}
	});

    for (let i=0; i < datasets.length; i++) {
        addDataDisplay(datasets[i].dataset, chart.data.datasets[i], maxDays);
    }
    charts.push(chart);
}

function initialize() {
    simulation = new CovidSimulation("2020-03-01");

	Chart.defaults.global.elements.point.backgroundColor = 'rgba(255, 99, 132, 0.3)';
	Chart.defaults.global.elements.point.borderColor = 'rgba(255, 99, 132, .7)';
	Chart.defaults.global.elements.point.borderWidth = 1;

    var leftYAxe = [ {id: 'left'} ];
    var leftRightYAxes = [ {id: 'left'},
                           {id: 'right', position: 'right'} ];

    var datasets1 = [ {
			label: 'počet aktuálně nakažených',
            dataset: 'aktualneNakazenoDetected',
            yAxisID: 'left'
		}, {
			label: 'počet mrtvých',
            dataset: 'kumulativniPocetUmrti',
            yAxisID: 'right',
		}];
    createChart("canvas1", DISPLAY_N_DAYS, datasets1, leftRightYAxes);

    var datasets2 = [ {
			label: 'počet nově nakažených',
            dataset: 'noveNakazenoDetected',
            yAxisID: 'left'
		}, {
			label: 'počet nových mrtvých',
            dataset: 'noveUmrti',
            yAxisID: 'right',
		}];
    createChart("canvas2", DISPLAY_N_DAYS, datasets2, leftRightYAxes);

    var datasets3 = [ {
			label: 'smrtnost [%]',
            dataset: 'smrtnostPct',
		}];
    createChart("canvas3", DISPLAY_N_DAYS, datasets3, leftYAxe);

    simulation.simDays.forEach(day => displayData(day));
}
initialize();

document.getElementById("play").innerHTML = "<i class=\"fas fa-play\"></i>";
document.getElementById("play").style = "background-color: var(--blue)";
function play() {
	if (!playBool) {
		document.getElementById("play").innerHTML = "<i class=\"fas fa-play\"></i>";
		document.getElementById("play").style = "background-color: var(--blue)";
		return;
	}
	document.getElementById("play").innerHTML = "<i class=\"fas fa-pause\"></i>";
	document.getElementById("play").style = "background-color: var(--red)";
	displayData(simulation.simOneDay());

	setTimeout(play, playSpeed);
}


function hideUpozorneni() {
	document.getElementById("upozorneni").style.display = "none";
}
