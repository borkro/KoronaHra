var mitigations = [];
let costScaler = 3;
addMitigation("faceMasks",   0.30, 10 * costScaler, "Roušky");
addMitigation("distancing",  0.23, 15 * costScaler, "Rozestupy");
addMitigation("schools",     0.08, 50 * costScaler, "Zavřít školy");
addMitigation("restaurants", 0.10, 25 * costScaler, "Restaurace");
addMitigation("bars",        0.12, 20 * costScaler, "Zavřít bary");
addMitigation("travel",      0.07, 30 * costScaler, "Zavřít hranice");
addMitigation("eventsSome",  0.12, 20 * costScaler, "Omezení akcí");
addMitigation("eventsAll",   0.20, 30 * costScaler, "Zrušit akce");

// Special checkbox to close everything
// addMitigation("lockdown",   0.00,  0, "LOCKDOWN");

let defaultMitigationPes1 = [ "faceMasks", "distancing" ];
let defaultMitigationPes2 = [ "faceMasks", "distancing", "bars", "restaurants", "eventsSome" ];
let defaultMitigation = { "pes-1": defaultMitigationPes1,
                          "pes-2": defaultMitigationPes2,
                        };


function addMitigation(id, effectivity, costMPerDay, label) {
    mitigations.push({
        id: id,
        label: label,
        eff: effectivity,
        cost: costMPerDay
    });
}

function initMitigation() {
    for(let i = 1; i < 3; i++) {
        let checkboxesHtml = ""
        checkboxesElement = document.getElementById('checkboxes');
        let pes = `pes-${i}-`;

        mitigations.forEach( mitigation =>
            checkboxesHtml += `<label for="${pes+mitigation.id}" class="checkbox-label">\n\
            <input type="checkbox" name="${pes+mitigation.id}" id="${pes+mitigation.id}" onchange="mitigationCheckboxOnChange(this.id)"> \n\
            ${mitigation.label}\n\
        </label>`
        );

        document.getElementById(`pes-${i}-checkboxes`).innerHTML = checkboxesHtml;
    }

    for(let pes in defaultMitigation) {
        defaultMitigation[pes].forEach(mitigation => document.getElementById(pes + "-" + mitigation).checked = true);
    }
}


function mitigationCheckboxOnChange(id) {
    let pes = id.slice(0,5);
    let mitigation = id.slice(6);

    if (!document.getElementById(id).checked) {
        return;
    }

    if (mitigation == "eventsAll") document.getElementById(pes + "-eventsSome").checked = false;
    if (mitigation == "eventsSome") document.getElementById(pes + "-eventsAll").checked = false;
}

function getMitigation() {
    let mult = 1.0;
    let cost = 0;

    let pesRadioButtons = document.getElementsByName('pes');

    let pesLevel = "pes-0";
    for(let i = 0; i < pesRadioButtons.length; i++) {
        if (pesRadioButtons[i].checked) {
            pesLevel = pesRadioButtons[i].id;
        }
    }

    if(pesLevel == "pes-0") {
        // Use default values
    } else if(pesLevel == "pes-3") {
        // Lockdown - turn on all mitigations
        mitigations.forEach( mitigation => {
	        if (mitigation.id != "eventsSome") {
		        mult *= (1 - mitigation.eff);
                cost += mitigation.cost;
	        }
        });
     } else {
        mitigations.forEach( mitigation => {
	        if (document.getElementById(pesLevel + "-" + mitigation.id).checked) {
		        mult *= (1 - mitigation.eff);
                cost += mitigation.cost;
	        }
        });
    }

    return {mult: mult, cost: cost};
}

initMitigation();
