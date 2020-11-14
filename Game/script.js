let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

const minSizeOfData = 100;
const startNakazeno = 1;

let r = 2.4;
const R = r;
let smrtnost = 0.012;
let population = 10690000;
let pocetIteraciDne = 0;
let noveNakazeno = [];
let inkubDoba = 5;
let nemocDoba = 14;
let imunDoba = 90;
let kumulativniPocetNakazenych = [];
let noveUmrti = [];
let procentoNakazitelnych = 0;
let kumulativniPocetUmrti = 0;

let chart, chartData;

let playBool = false;


function addData(data) {
	let newDatum = plusDen(chart.data.labels[chart.data.labels.length - 1]);
	chart.data.labels.push(newDatum);
	chart.data.datasets.forEach((dataset) => {
		dataset.data.push(data);
	});
	removeData();
	/* if (chart.scales["y-axis-0"].max < 8000)
	chart.options.scales.yAxes[0].ticks.max = 8000; */
	chart.update();
}

function removeData() {
	if (chart.data.labels.length - 1 >= minSizeOfData)
		chart.data.labels.shift();
	chart.data.datasets.forEach((dataset) => {
		if (dataset.data.length - 1 >= minSizeOfData)
			dataset.data.shift();
	});
	chart.update();
}

function initialize() {
	chartData = {
		labels: ["2020-01-01"],
		datasets: [{
			label: 'počet nakažených',
			data: [startNakazeno],
			backgroundColor: [
				'rgba(255, 99, 132, 0.3)'
			],
			pointBackgoundColor: [
				'rgba(255, 99, 132, 0.3)'
			],
			pointBorderColor: [
				'rgba(255, 99, 132, 0.3)'
			],
			borderColor: [
				'rgba(255, 99, 132, 1)'
			],
			borderWidth: 2,
			lineTension: 0
		}]
	};

	kumulativniPocetUmrti = 0;

	kumulativniPocetNakazenych.push(startNakazeno);
	noveNakazeno.push(startNakazeno);
	noveUmrti.push(0);

	for (let i = 0; i < inkubDoba; i++) {
		chartData.labels.push(plusDen(chartData.labels[chartData.labels.length - 1]));
		chartData.datasets[0].data.push(0);
		kumulativniPocetNakazenych.push(startNakazeno);
		noveNakazeno.push(0);
		noveUmrti.push(0);
	}

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
					ticks: {
						beginAtZero: true
					}
					//type: 'logarithmic'
				}],
				xAxes: [{
					ticks: {
						autoskip: true/* ,
						maxRotation: 0 */
					}
				}]
			}
		}
	});

	document.getElementById("kumulativniUmrti").innerHTML = kumulativniPocetUmrti;
	document.getElementById("dnesUmrti").innerHTML = noveUmrti[noveUmrti.length - 1];
}
initialize();

document.getElementById("play").innerHTML = "PLAY";
function play() {
	if (playBool) {
		document.getElementById("play").innerHTML = "PLAY";
		return;
	}
	document.getElementById("play").innerHTML = "PAUSE";
	addData(calcData());

	setTimeout(play, 500);
}

function calcData() {
	return 0;
}