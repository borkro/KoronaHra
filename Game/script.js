const DISPLAY_N_DAYS = 150;
const playSpeed = 350; // ms

const SMALLER_CHART_FONT_SIZE = 9;
const BIGGER_CHART_FONT_SIZE = 12;
const minSizeOfData = 150;

let dataDisplays = [];
let charts = [];

let playBool = false;

let simulation = null;


function addDataDisplay(func, chartDataset, maxDays) {
	dataDisplays.push({
		func: func,
		chartDataset: chartDataset,
		maxDays: maxDays
	});
}

function displayData(simDay) {
	// Display all new data
	dataDisplays.forEach(display => {
		let chartData = display.chartDataset.data;
		chartData.push(display.func(simDay));
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
	document.getElementById("mortality").innerHTML = formatWithThousandsSeparator(simDay.mortality * 100, 2);
	document.getElementById("costTotal").innerHTML = formatWithThousandsSeparator(simDay.costTotal / 1e9, 1);

	// End of game
	if (simDay.vaccinationRate == simulation.vaccinationMaxRate) {
		end(simDay);
	}
}

function createChart(canvasId, maxDays, datasets, yAxes, fontSize=SMALLER_CHART_FONT_SIZE) {
	let canvas = document.getElementById(canvasId);
	let canvasCtx = canvas.getContext("2d");

	let datasetDefault = {
		data: [],
		borderWidth: 1,
		pointRadius: 2,
		lineTension: 0.0,
	};
	let colorDefault = [
		'rgba(  0,   0, 255, .7)',
		'rgba(255,   0,   0, .7)',
		'rgba(  0, 255,   0, .7)',
	];

	let chartDatasets = [];

	for (let i = 0; i < datasets.length; i++) {
		let dataset = datasets[i];
		let d = copyDictWithDefault(dataset, datasetDefault);
		delete d.dataset;
		if (!d["borderColor"]) {
			d["borderColor"] = colorDefault[i];
		}
		chartDatasets.push(d);
	}

	let chartYAxes = [];
	let yAxisDefault = {
		ticks: {
			fontSize: fontSize,
			beginAtZero: true,
		}
	};

	yAxes.forEach(yAxis => {
		chartYAxes.push(copyDictWithDefault(yAxis, yAxisDefault));
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
						fontSize: fontSize,
						autoskip: true,
						/* maxRotation: 0 */
					}
				}]
			},
			tooltips: {
				enabled: false
			},
			legend: {
				labels: {
					fontSize: fontSize,
				}
			}
		}
	});

	for (let i = 0; i < datasets.length; i++) {
		addDataDisplay(datasets[i].dataset, chart.data.datasets[i], maxDays);
	}
	charts.push(chart);
}

function initialize() {
	simulation = new CovidSimulation("2020-03-01");

	Chart.defaults.global.elements.point.backgroundColor = 'rgba(255, 99, 132, 0.3)';
	Chart.defaults.global.elements.point.borderColor = 'rgba(255, 99, 132, .7)';
	Chart.defaults.global.elements.point.borderWidth = 1;

	var autoDecimalTicks = {
		callback: function (value, index, values) {
			return formatWithThousandsSeparator(value, values[0] > 1 ? 1 : 3);
		}
	};
	var simpleLeftAxis = [{ id: 'left' }];
	var autoDecimalLeftAxis = [{ id: 'left', ticks: autoDecimalTicks }];
	var autoDecimalLeftRightAxes = [{ id: 'left', ticks: autoDecimalTicks },
	{ id: 'right', ticks: autoDecimalTicks, position: 'right' }];

	var datasets11 = [{
		label: 'nově nakažených [tis]',
		dataset: x => x.detectedInfectionsToday / 1000,
		borderWidth: 2,
		pointRadius: 4,
		yAxisID: 'left',
	}, {
		label: 'nových mrtvých [tis]',
		dataset: x => x.deathsToday / 1000,
		borderWidth: 2,
		pointRadius: 4,
		yAxisID: 'right',
	}];
	createChart("chart-1-1", DISPLAY_N_DAYS, datasets11, autoDecimalLeftRightAxes, fontSize=BIGGER_CHART_FONT_SIZE);

	var datasets14 = [{
		label: 'nově nakažených (poslední měsíc) [tis]',
		dataset: x => x.detectedInfectionsToday / 1000,
	}];
	createChart("chart-1-4", 30, datasets14, autoDecimalLeftAxis);

	var datasets24 = [{
		label: 'nově nakažených 7 denní průměr [tis]',
		dataset: x => x.detectedInfections7DayAvg / 1000,
	}];
	createChart("chart-2-4", 30, datasets24, autoDecimalLeftAxis);

	var datasets34 = [{
		label: 'smrtnost [%]',
		dataset: x => x.mortality * 100,
	}];
	createChart("chart-3-4", DISPLAY_N_DAYS, datasets34, simpleLeftAxis);

	var datasets41 = [{
		label: 'aktuálně nakažených [tis]',
		dataset: x => x.detectedActiveInfectionsTotal / 1000,
		yAxisID: 'left',
	}];
	createChart("chart-4-1", DISPLAY_N_DAYS, datasets41, autoDecimalLeftAxis);

	var datasets42 = [{
		label: 'celkem nakažených [tis]',
		dataset: x => x.detectedInfectionsTotal / 1000,
	}];
	createChart("chart-4-2", DISPLAY_N_DAYS, datasets42, autoDecimalLeftAxis);

	var datasets43 = [{
		label: 'celkem mrtvých [tis]',
		dataset: x => x.deadTotal / 1000,
	}];
	createChart("chart-4-3", DISPLAY_N_DAYS, datasets43, autoDecimalLeftAxis);

	var datasets44 = [{
		label: 'kapacita nemocnic [%]',
		dataset: x => x.hospitalizationCapacity * 100,
	}, {
		label: '100%',
		dataset: x => 100,
	}];
	createChart("chart-4-4", DISPLAY_N_DAYS, datasets44, simpleLeftAxis);

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

function end(endDay) {
	document.getElementById("datumEndOfGame").innerHTML = endDay.date;
	document.getElementById("vaccinationRateEndOfGame").innerHTML = `${formatWithThousandsSeparator(100 * endDay.vaccinationRate, 0)}%`;
	document.getElementById("deadTotalEndOfGame").innerHTML = formatWithThousandsSeparator(Math.round(endDay.deadTotal), 0);
	document.getElementById("mortalityEndOfGame").innerHTML = `${formatWithThousandsSeparator(endDay.mortality * 100, 2)}%`;
	document.getElementById("costTotalEndOfGame").innerHTML = formatWithThousandsSeparator(endDay.costTotal / 1e9, 1) + " mld. Kč";
	playBool = !playBool;
	endOfGame(true);
}

function endOfGame(bool) {
	document.getElementById("endOfGame").style.visibility = bool ? "visible" : "hidden";
}
