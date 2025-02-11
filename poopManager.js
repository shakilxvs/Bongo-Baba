class PoopManager {
    constructor(scene) {
        this.scene = scene;
        this.poops = [];
        this.maxPoops = 5;
        this.createPoop();
    }

    createPoop() {
        if (this.poops.length < this.maxPoops) {
            let poop = this.scene.matter.add.image(150, 450, 'poop');
            poop.setCircle(20);
            poop.setStatic(true); // Keeps it attached to the slingshot
            this.poops.push(poop);
        }
    }

    launchPoop() {
        if (this.poops.length > 0) {
            let poop = this.poops.shift(); // Get the first poop
            poop.setStatic(false);
            poop.setVelocity(10, -10); // Launch poop

            // Create a new poop after a short delay
            this.scene.time.delayedCall(1000, () => this.createPoop(), [], this);
        }
    }
}
