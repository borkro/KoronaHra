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
	document.getElementById("vaccinationRate").innerHTML = formatWithThousandsSeparator(100 * simDay.vaccinationRate, 0);
	document.getElementById("deadTotal").innerHTML = formatWithThousandsSeparator(Math.round(simDay.deadTotal), 0);
	document.getElementById("deathsToday").innerHTML = formatWithThousandsSeparator(Math.round(simDay.deathsToday), 0);
	document.getElementById("costTotal").innerHTML = formatWithThousandsSeparator(simDay.costTotal / 1e3, 1);
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
		lineTension: 0.0
	};
	let colorDefault = [
		'rgba(  0,   0, 255, .7)',
		'rgba(255,   0,   0, .7)',
		'rgba(  0, 255,   0, .7)',
	];

	let chartDatasets = [];

	for (let i = 0; i < datasets.length; i++) {
		let dataset = datasets[i];
		let d = copyWithDefault(dataset, datasetDefault);
		delete d.dataset;
		if (!d["borderColor"]) {
			d["borderColor"] = colorDefault[i];
		}
		chartDatasets.push(d);
	}

	let chartYAxes = [];
	let yAxisDefault = {
		ticks: {
			beginAtZero: true,
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
			},
			tooltips: {
				callbacks: {
					label: function (tooltipItem) {
						return Number(tooltipItem.yLabel);
					}
				}
			}
		}
	});

	for (let i = 0; i < datasets.length; i++) {
		addDataDisplay(datasets[i].dataset, chart.data.datasets[i], maxDays);
	}
	charts.push(chart);
}

function formatWithThousandsSeparator(value, dec) {
	if (value < 0) {
		return "-" + formatWithThousandsSeparator(-value, dec);
	}

	let v = Math.floor(value);
	let ret = "0";
	// whole number part
	if (v < 1000) {
		ret = v.toString();
	} else {
		let a = (v % 1000 + 1000).toString().slice(1);
		ret = formatWithThousandsSeparator(v / 1000, 0) + "," + a;
	}

	if (dec > 0) {
		let frac = Math.floor((1 + value - v) * Math.pow(10, dec)).toString().slice(1);
		ret = ret + "." + frac;
	}

	return ret;
}

function initialize() {
	simulation = new CovidSimulation("2020-03-01");

	Chart.defaults.global.elements.point.backgroundColor = 'rgba(255, 99, 132, 0.3)';
	Chart.defaults.global.elements.point.borderColor = 'rgba(255, 99, 132, .7)';
	Chart.defaults.global.elements.point.borderWidth = 1;

	var thousandsTicks = {
		beginAtZero: true,
		callback: function (value, index, values) {
			return formatWithThousandsSeparator(value / 1000, values[0] > 1000 ? 1 : 3);
		}
	};
	var simpleLeftAxe = [{ id: 'left' }];
	var thousandsLeftAxe = [{ id: 'left', ticks: thousandsTicks }];
	var thousandsLeftRightAxes = [{ id: 'left', ticks: thousandsTicks },
	{ id: 'right', ticks: thousandsTicks, position: 'right' }];

	var datasets11 = [{
		label: 'nově nakažených [tis]',
		dataset: 'detectedInfectionsToday',
		yAxisID: 'left',
	}, {
		label: 'nových mrtvých [tis]',
		dataset: 'deathsToday',
		yAxisID: 'right',
	}];
	createChart("chart-1-1", DISPLAY_N_DAYS, datasets11, thousandsLeftRightAxes);

	var datasets21 = [{
		label: 'aktuálně nakažených [tis]',
		dataset: 'detectedActiveInfectionsTotal',
		yAxisID: 'left',
	}];
	createChart("chart-2-1", DISPLAY_N_DAYS, datasets21, thousandsLeftAxe);

	var datasets22 = [{
		label: 'nakažených [tis]',
		dataset: 'detectedInfectionsTotal',
		yAxisID: 'left',
	}, {
		label: 'mrtvých [tis]',
		dataset: 'deadTotal',
		yAxisID: 'right',
	}];
	createChart("chart-2-2", DISPLAY_N_DAYS, datasets22, thousandsLeftRightAxes);

	var datasets23 = [{
		label: 'smrtnost [%]',
		dataset: 'mortalityPct',
	}];
	createChart("chart-2-3", DISPLAY_N_DAYS, datasets23, simpleLeftAxe);

	simulation.simDayStats.forEach(day => displayData(day));
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
