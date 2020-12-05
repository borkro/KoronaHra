// Discrete SIR model variant with delay and reinfections

class CovidSimulation {
    constructor(startDate) {
        // pandemic params
        this.R0 = 2.5;
        this.mortality = 0.012;
        this.initialPopulation = 10690000;
        this.infectedStart = 3;

        // All covid parameters counted from the infection day
        this.incubationDays = 5; // Days until infection is detected
        this.infectiousFrom = 3; // First day when people are infectious
        this.infectiousTo = 8;   // Last day when people are infectious (they will isolate after the onset of COVID)
        this.recoveryDays = 14 + this.incubationDays;
        this.timeToDeathDays = 21 + this.incubationDays;
        this.immunityDays = 90 + this.recoveryDays;

        this.simDays = [];
        this.simDayStats = [];

        this.simDays.push({
            date: startDate,
            suspectible: this.initialPopulation - this.infectedStart,
            infected: this.infectedStart,
            recovered: 0,
            dead: 0,
            infectedToday: this.infectedStart,
            deathsToday: 0
        });

        this.calcStats();
    }

    getDayInPast(n) {
        let i = this.simDays.length - n;
        if (i >= 0) {
            return this.simDays[i];
        } else {
            // Days before the start of the epidemic have no sick people
            return {
                date: null,
                suspectible: this.initialPopulation,
                infected: 0,
                recovered: 0,
                dead: 0,
                infectedToday: 0,
                deathsToday: 0
            };
        }
    }

    simOneDay() {
        let yesterday = this.getDayInPast(1);
        let mRate = this.mortality;       // mortality rate
        let sRate = 1. - this.mortality;  // survival rate

        let suspectible = yesterday.suspectible;
        let infected = yesterday.infected;
        let recovered = yesterday.recovered;
        let dead = yesterday.dead;

        let population = yesterday.suspectible + yesterday.infected + yesterday.recovered;
        let infectious = 0.;
        for (let i = this.infectiousFrom; i <= this.infectiousTo; ++i) {
            infectious += this.getDayInPast(i).infectedToday;
        }
        infectious /= (this.infectiousTo - this.infectiousFrom + 1);
        let infectedToday = infectious * this.R0 * getMitigationMult() * yesterday.suspectible / population;
        infected += infectedToday;
        suspectible -= infectedToday;

        let recoveredToday = this.getDayInPast(this.recoveryDays).infectedToday * sRate;
        recovered += recoveredToday;
        infected -= recoveredToday;

        let deathsToday = this.getDayInPast(this.timeToDeathDays).infectedToday * mRate;
        dead += deathsToday;
        infected -= deathsToday;

        let endedImmunityToday = this.getDayInPast(this.immunityDays).infectedToday * sRate;
        suspectible += endedImmunityToday;
        recovered -= endedImmunityToday;

        this.simDays.push({
            date: plusDay(yesterday.date),
            suspectible: suspectible,
            infected: infected,
            recovered: recovered,
            dead: dead,
            infectedToday: infectedToday,
            deathsToday: deathsToday
        });

        return this.calcStats();
    }

    calcStats() {
        let today = this.getDayInPast(1);
        let lastStat = (this.simDayStats.length > 0) ? this.simDayStats[this.simDayStats.length - 1] : null;


        let undetectedInfections = 0;
        for(let i = 1; i <= this.incubationDays; i++) {
            undetectedInfections += this.getDayInPast(i).infectedToday;
        }

        let detectedInfectionsToday = this.getDayInPast(this.incubationDays + 1).infectedToday;
        let detectedInfectionsTotal = ((lastStat != null) ? lastStat.detectedInfectionsTotal : 0)
                + detectedInfectionsToday;

        let stats = {
            date: today.date,
            deadTotal: today.dead,
            deathsToday: today.deathsToday,
            detectedInfectionsToday: detectedInfectionsToday,
            detectedInfectionsTotal: detectedInfectionsTotal,
            detectedActiveInfectionsTotal: today.infected - undetectedInfections,
            mortalityPct: 100. * today.dead / detectedInfectionsTotal,
        };

        this.simDayStats.push(stats);

        return stats;
    }
 }

