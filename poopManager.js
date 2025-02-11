class PoopManager {
    constructor(scene) {
        this.scene = scene;
        this.poops = [];
        this.maxPoops = 5;
        this.createPoop();
    }

    createPoop() {
        if (this.poops.length < this.maxPoops) {
            let poop = this.scene.matter.add.image(150, this.scene.cameras.main.height - 150, 'poop');
            poop.setCircle(20);
            poop.setStatic(true);
            this.poops.push(poop);
        }
    }

    launchPoop() {
        if (this.poops.length > 0) {
            let poop = this.poops.shift();
            poop.setStatic(false);
            poop.setVelocity(10, -10);

            this.scene.time.delayedCall(1000, () => this.createPoop(), [], this);
        }
    }
}
