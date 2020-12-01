
class CovidSimulation {
    constructor(startDate) {
        // pandemic params
        this.R0 = 2.5;
        this.smrtnost = 0.012;
        this.population = 10690000;
        this.inkubDoba = 5;
        this.nemocDoba = 14;
        this.imunDoba = 90;
        this.startNakazeno = 3;

        this.simDays = [];

        this.simDays.push({
            date: startDate,
            noveNakazenoDetected: 0,
            kumulativniPocetNakazenychDetected: 0,              // After incubation
            noveNakazenoReal: this.startNakazeno,
            kumulativniPocetNakazenychReal: this.startNakazeno, // Including before incubation
            realAktualneNakazeno: this.startNakazeno,
            aktualneNakazenoDetected: 0,
            pocetPrenasecu: this.startNakazeno,
            noveUmrti: 0,
            kumulativniPocetUmrti: 0
        });

        for (let i = 1; i < this.inkubDoba; i++) {
            this.simOneDay();
        }
    }

    getDayInPast(n) {
        let i = this.simDays.length - n;
        if (i >= 0) {
            return this.simDays[i];
        } else {
            // Days before the start of the epidemic have no sick people
            return {
                noveNakazenoDetected: 0,
                kumulativniPocetNakazenychDetected: 0,
                noveNakazenoReal: 0,
                kumulativniPocetNakazenychReal: 0,
                realAktualneNakazeno: 0,
                aktualneNakazenoDetected: 0,
                pocetPrenasecu: 0,
                noveUmrti: 0,
                kumulativniPocetUmrti: 0
            };
        }
    }

    getLastDay() {
        return this.getDayInPast(1);
    }

    simOneDay() {
        let celkemPrenasecu = 0;
        let yesterday = this.getDayInPast(1);
        let todayMinusIncubation = this.getDayInPast(this.inkubDoba);

        this.population -= yesterday.noveUmrti;
        for (let i = Math.max(this.simDays.length - this.inkubDoba, 0); i < this.simDays.length; i++) {
            celkemPrenasecu += this.simDays[i].noveNakazenoReal;
        }

        let rZaDen = this.R0;
        if (this.inkubDoba)
            rZaDen /= this.inkubDoba;
        rZaDen *= nakazitelni(this.getDayInPast(1 + this.imunDoba).kumulativniPocetNakazenychReal, yesterday.kumulativniPocetNakazenychReal, this.population);
        rZaDen *= getMitigationMult();
        let noveNakazenoReal = rZaDen * celkemPrenasecu;

        let infectionsResolved = this.getDayInPast(1 + this.nemocDoba).noveNakazenoReal;
        let noveUmrti = this.smrtnost * infectionsResolved;
        let kumulativniPocetNakazenychDetected = todayMinusIncubation.kumulativniPocetNakazenychReal;
        let kumulativniPocetNakazenychReal = yesterday.kumulativniPocetNakazenychReal + noveNakazenoReal;
        let realAktualneNakazeno = yesterday.realAktualneNakazeno + noveNakazenoReal - infectionsResolved;
        let aktualneNakazenoDetected = Math.max(0, realAktualneNakazeno - (kumulativniPocetNakazenychReal - kumulativniPocetNakazenychDetected));
        let kumulativniPocetUmrti = yesterday.kumulativniPocetUmrti + noveUmrti;
        let smrtnost = kumulativniPocetNakazenychDetected > 0 ? kumulativniPocetUmrti / kumulativniPocetNakazenychDetected : 0;
        this.simDays.push({
            date: plusDen(yesterday.date),
            noveNakazenoDetected: todayMinusIncubation.noveNakazenoReal,
            kumulativniPocetNakazenychDetected: kumulativniPocetNakazenychDetected,
            noveNakazenoReal: noveNakazenoReal,
            kumulativniPocetNakazenychReal: kumulativniPocetNakazenychReal,
            realAktualneNakazeno: realAktualneNakazeno,
            aktualneNakazenoDetected: aktualneNakazenoDetected,
            pocetPrenasecu: celkemPrenasecu,
            noveUmrti: noveUmrti,
            kumulativniPocetUmrti: kumulativniPocetUmrti,
            smrtnostPct: smrtnost * 100
        });

        return this.getLastDay();
    }
}


function nakazitelni(predImunDobou, celkove, L) {
	return ((celkove - predImunDobou) < L ? ((L - celkove + predImunDobou) / L) : 0);
}
