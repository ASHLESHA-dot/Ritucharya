class PrakritiEngine {

    constructor(answers) {
        this.a = answers;
    }

    get(key) {
        return Number(this.a[key] || 0);
    }

    calculateScores() {

        const V =
            this.get("A1") * 5 +
            this.get("A2") * 3 +
            this.get("A3") * 6 +
            this.get("A4") * 5 +
            this.get("A5") * 4 +
            this.get("A6") * 5 +
            this.get("A7_1") * 7 +
            this.get("A7_2") * 5 +
            this.get("A8") * 5;

        const P =
            this.get("B1") * 8 +
            this.get("B2") * 3 +
            this.get("B3") * 5 +
            this.get("B4") * 7 +
            this.get("B5") * 4 +
            this.get("B6") * 5 +
            this.get("B7_1") * 5 +
            this.get("B7_2") * 3 +
            this.get("B7_3") * 3 +
            this.get("B8") * 3;

        const K =
            this.get("C1") * 4 +
            this.get("C2") * 4 +
            this.get("C3") * 6 +
            this.get("C4") * 5 +
            this.get("C5") * 6 +
            this.get("C6") * 5 +
            this.get("C7_3") * 7 +
            this.get("C7_4") * 5 +
            this.get("C8") * 5;

        const scores = {
            Vata: V,
            Pitta: P,
            Kapha: K
        };

        const prakriti = Object.keys(scores).reduce((a, b) =>
            scores[a] > scores[b] ? a : b
        );

        return {
            prakriti,
            scores
        };
    }
}

module.exports = PrakritiEngine;