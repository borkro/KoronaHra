let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

const playSpeed = 500; // ms

const minSizeOfData = 150;
const startNakazeno = 1;

const R = 1.5;
let smrtnost = 0.012;
let population = 10690000;
let pocetIteraciDne = 0;
let noveNakazenoReal = [];
let inkubDoba = 5;
let nemocDoba = 14;
let imunDoba = 80;
let kumulativniPocetNakazenych = [];
let noveUmrti = [];
let procentoNakazitelnych = 0;
let kumulativniPocetUmrti = 0;
let rZaDen = R / inkubDoba;
let realAktualneNakazeno = [];

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
			borderColor: [
				'rgba(255, 99, 132, 1)'
			],
			borderWidth: 2,
			lineTension: 0
		}]
	};

	for (let i = 0; i < imunDoba; i++) {
		kumulativniPocetNakazenych.push(0);
	}

	kumulativniPocetNakazenych.push(startNakazeno);
	noveNakazenoReal.push(startNakazeno);
	realAktualneNakazeno.push(startNakazeno);
	noveUmrti.push(0);


	for (let i = 0; i < inkubDoba - 1; i++) {
		chartData.labels.push(plusDen(chartData.labels[chartData.labels.length - 1]));
		let celkemNoveNakazeno = 0;
		for (let j = 0; j < i; j++) {
			rZaDen = R / inkubDoba;
			rZaDen *= nakazitelni(kumulativniPocetNakazenych[j], kumulativniPocetNakazenych[j + imunDoba] + celkemNoveNakazeno, population);
			celkemNoveNakazeno += rZaDen * noveNakazenoReal[j];
		}
		let newData = celkemNoveNakazeno;
		noveNakazenoReal.push(newData);
		kumulativniPocetNakazenych.push(kumulativniPocetNakazenych[kumulativniPocetNakazenych.length - 1] + newData);
		if (noveNakazenoReal[noveNakazenoReal.length - nemocDoba - 1])
			newData -= noveNakazenoReal[noveNakazenoReal.length - nemocDoba - 1];
		realAktualneNakazeno.push(realAktualneNakazeno[realAktualneNakazeno.length - 1] + newData);
		chartData.datasets[0].data.push(Math.round(realAktualneNakazeno[realAktualneNakazeno.length - 1]));
		noveUmrti.push(0);
	}

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
	if (!playBool) {
		document.getElementById("play").innerHTML = "PLAY";
		return;
	}
	document.getElementById("play").innerHTML = "PAUSE";
	addData(calcData());

	setTimeout(play, playSpeed);
}

function calcData() {
	//let iDoba = imunDoba >= noveNakazenoReal.length ? (noveNakazenoReal.length - 1) : imunDoba;

	let celkemNoveNakazeno = 0;
	for (let i = realAktualneNakazeno.length - inkubDoba - 1; i < realAktualneNakazeno.length; i++) {
		if (realAktualneNakazeno[i] + 1) {
			rZaDen = R / inkubDoba;
			rZaDen *= nakazitelni(kumulativniPocetNakazenych[i], kumulativniPocetNakazenych[i + imunDoba] + celkemNoveNakazeno, population);
			celkemNoveNakazeno += (rZaDen * noveNakazenoReal[i]);
		}
	}
	let newData = celkemNoveNakazeno;
	noveNakazenoReal.push(newData);
	kumulativniPocetNakazenych.push(kumulativniPocetNakazenych[kumulativniPocetNakazenych.length - 1] + newData);

	if (noveNakazenoReal[noveNakazenoReal.length - nemocDoba - 1] + 1)
		newData -= noveNakazenoReal[noveNakazenoReal.length - nemocDoba - 1];
	realAktualneNakazeno.push(realAktualneNakazeno[realAktualneNakazeno.length - 1] + newData);
	return Math.round(realAktualneNakazeno[realAktualneNakazeno.length - 1] + newData);
}

function nakazitelni(predImunDobou, celkove, L) {
	return ((L - celkove + predImunDobou) / L);
}