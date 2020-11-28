let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

const playSpeed = 350; // ms

const minSizeOfData = 150;

const LEFT_AXIS_VARIABLE = "aktualneNakazenoDetected";
const RIGHT_AXIS_VARIABLE = "kumulativniPocetUmrti";

// const LEFT_AXIS_VARIABLE = "noveNakazenoDetected";
// const RIGHT_AXIS_VARIABLE = "noveUmrti";

let chart, chartData;

let playBool = false;

let simulation = null;


function addData(simDay) {
	chart.data.labels.push(simDay.date);
	chart.data.datasets[0].data.push(simDay[LEFT_AXIS_VARIABLE]);
	chart.data.datasets[1].data.push(simDay[RIGHT_AXIS_VARIABLE]);
	removeData();
	/* if (chart.scales["y-axis-0"].max < 8000)
	chart.options.scales.yAxes[0].ticks.max = 8000; */
	chart.update();

	document.getElementById("datum").innerHTML = simDay.date;
	document.getElementById("kumulativniUmrti").innerHTML = Math.round(simDay.kumulativniPocetUmrti);
	document.getElementById("dnesUmrti").innerHTML = Math.round(simDay.noveUmrti);
}

function removeData() {
	if (chart.data.labels.length - 1 >= minSizeOfData)
		chart.data.labels.shift();
	chart.data.datasets.forEach((dataset) => {
		if (dataset.data.length - 1 >= minSizeOfData)
			dataset.data.shift();
	});
}

function initialize() {
	chartData = {
		labels: [],
		datasets: [{
			label: 'počet nakažených',
            yAxisID: 'left',
			data: [],
			backgroundColor: [
				'rgba(255, 99, 132, 0.3)'
			],
			borderColor: [
				'rgba(255, 99, 132, 1)'
			],
			borderWidth: 2,
			lineTension: 0.4
		}, {
			label: 'počet mrtvých',
            yAxisID: 'right',
			data: [],
			borderWidth: 2,
			lineTension: 0.4
		}]
	};

    simulation = new CovidSimulation("2020-03-01");
    simulation.simDays.forEach( day => {
		chartData.labels.push(day.date);
		chartData.datasets[0].data.push(day[LEFT_AXIS_VARIABLE]);
		chartData.datasets[1].data.push(day[RIGHT_AXIS_VARIABLE]);
    });

	Chart.defaults.global.elements.point.backgroundColor = 'rgba(255, 99, 132, 0.3)';
	Chart.defaults.global.elements.point.borderColor = 'rgba(255, 99, 132, .7)';
	Chart.defaults.global.elements.point.borderWidth = 1;


	chart = new Chart(ctx, {
		type: 'line',
		fill: 'start',
		data: chartData,
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
				yAxes: [{
                    id: 'left',
					ticks: {
						beginAtZero: true//,
					}/* ,
					type: 'logarithmic' */
				}, {
                    id: 'right',
                    position: 'right',
					ticks: {
						beginAtZero: true//,
					}/* ,
					type: 'logarithmic' */
				} ],
				xAxes: [{
					ticks: {
						autoskip: true/* ,
						maxRotation: 0 */
					}
				}]
			}
		}
	});

    let simDay = simulation.getLastDay();

	document.getElementById("datum").innerHTML = simDay.date;
	document.getElementById("kumulativniUmrti").innerHTML = Math.round(simDay.kumulativniPocetUmrti);
	document.getElementById("dnesUmrti").innerHTML = Math.round(simDay.noveUmrti);
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
	addData(simulation.simOneDay());

	setTimeout(play, playSpeed);
}

