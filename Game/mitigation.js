let rouskyUcinnost = 0.3;
let rozetupyUcinnost = 0.23;
let skolyUcinnost = 0.08;
let restauraceUcinnost = 0.1;
let baryUcinnost = 0.12;
let akceUcinnost = 0.12;
let akceZrusUcinnost = 0.2;
let zahraniciUcinnost = 0.07;


function getMitigationMult() {
    let mitigationMult = 1.0;

	if (document.getElementById("lockdown").checked) {
		document.getElementById("rousky").checked = document.getElementById("rozestupy").checked = document.getElementById("skoly").checked =
			document.getElementById("restaurace").checked = document.getElementById("bary").checked = document.getElementById("akceZrus").checked =
			document.getElementById("akce").checked = document.getElementById("zahranici").checked = true;
	}

	if (document.getElementById("rousky").checked) {
		mitigationMult *= (1 - rouskyUcinnost);
	}
	if (document.getElementById("rozestupy").checked) {
		mitigationMult *= (1 - rozetupyUcinnost);
	}
	if (document.getElementById("skoly").checked) {
		mitigationMult *= (1 - skolyUcinnost);
	}
	if (document.getElementById("restaurace").checked) {
		mitigationMult *= (1 - restauraceUcinnost);
	}
	if (document.getElementById("bary").checked) {
		mitigationMult *= (1 - baryUcinnost);
	}
	if (document.getElementById("akceZrus").checked) {
		mitigationMult *= (1 - akceZrusUcinnost);
		document.getElementById("akce").checked = false;
	}
	if (document.getElementById("akce").checked) {
		mitigationMult *= (1 - akceUcinnost);
	}
	if (document.getElementById("zahranici").checked) {
		mitigationMult *= (1 - zahraniciUcinnost);
	}

    return mitigationMult;
}
