var mitigations = [];
let costScaler = 3;
addMitigation("faceMasks",   0.30, 10 * costScaler, "Roušky");
addMitigation("distancing",  0.23, 15 * costScaler, "Rozestupy");
addMitigation("schools",     0.08, 50 * costScaler, "Zavřít školy");
addMitigation("restaurants", 0.10, 25 * costScaler, "Zavřít restaurace");
addMitigation("bars",        0.12, 20 * costScaler, "Zavřít bary");
addMitigation("travel",      0.07, 30 * costScaler, "Zavřít hranice");
addMitigation("eventsSome",  0.12, 20 * costScaler, "Omezení akcí");
addMitigation("eventsAll",   0.20, 30 * costScaler, "Zrušit akce");

// Special checkbox to close everything
addMitigation("lockdown",   0.00,  0, "LOCKDOWN");


function addMitigation(id, effectivity, costMPerDay, label) {
    mitigations.push({
        id: id,
        label: label,
        eff: effectivity,
        cost: costMPerDay
    });
}

let checkboxesHtml = ""
checkboxesElement = document.getElementById('checkboxes');

mitigations.forEach( mitigation =>
    checkboxesHtml += `<label for="${mitigation.id}">\n\
    <input type="checkbox" name="${mitigation.id}" id="${mitigation.id}" onchange="mitigationCheckboxOnChange(this.id)"> \n\
    ${mitigation.label}\n\
</label>`
);

checkboxesElement.innerHTML = checkboxesHtml + checkboxesElement.innerHTML;

function mitigationCheckboxOnChange(id) {
    if (id != "lockdown") {
        document.getElementById("lockdown").checked = false;
    }

    if (!document.getElementById(id).checked) {
        return;
    }

    if (id == "lockdown") {
        mitigations.forEach( mitigation => document.getElementById(mitigation.id).checked = true);
        document.getElementById("eventsSome").checked = false;
    }

    if (id == "eventsAll") document.getElementById("eventsSome").checked = false;
    if (id == "eventsSome") document.getElementById("eventsAll").checked = false;
}

function getMitigation() {
    let mult = 1.0;
    let cost = 0;

    mitigations.forEach( mitigation => {
	    if (document.getElementById(mitigation.id).checked) {
		    mult *= (1 - mitigation.eff);
            cost += mitigation.cost;
	    }
    });

    return {mult: mult, cost: cost};
}
