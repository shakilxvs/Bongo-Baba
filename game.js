class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
        this.poopsUsed = 0;
        this.enemiesDefeated = 0;
        this.missedEnemies = 0;
        this.isPulling = false;
        this.slingshotBand = null;
    }

    preload() {
        // Load game assets
        this.load.image('background', 'https://cdn.shopify.com/s/files/1/0919/6814/3645/files/background.png');
        this.load.image('poop', 'https://cdn.shopify.com/s/files/1/0919/6814/3645/files/poop.png');
        this.load.image('baby', 'https://cdn.shopify.com/s/files/1/0919/6814/3645/files/baby_enemy.png');
        this.load.image('slingshot', 'https://cdn.shopify.com/s/files/1/0919/6814/3645/files/slingshot.png');

        // **Load background music**
        this.load.audio('backgroundMusic', 'https://cdn.shopify.com/s/files/1/0919/6814/3645/files/35345345.mp3?v=1739387927');
    }

    create() {
        // Add background image
        this.add.image(400, 300, 'background').setDisplaySize(800, 600);

        // Add slingshot
        this.slingshot = this.add.image(150, 450, 'slingshot').setDepth(1);

        // Slingshot band graphics
        this.slingshotBand = this.add.graphics();

        // Spawn initial poop and enemy
        this.spawnPoop();
        this.spawnEnemy();

        // **Play background music**
        this.backgroundMusic = this.sound.add('backgroundMusic', { loop: true, volume: 0.5 });
        this.backgroundMusic.play();

        // Collision handling
        this.matter.world.on('collisionstart', (event) => {
            event.pairs.forEach((pair) => {
                let bodyA = pair.bodyA;
                let bodyB = pair.bodyB;

                let gameObjectA = bodyA.gameObject;
                let gameObjectB = bodyB.gameObject;

                if (!gameObjectA || !gameObjectB) return;

                if (
                    (gameObjectA.texture.key === 'poop' && gameObjectB.texture.key === 'baby') ||
                    (gameObjectA.texture.key === 'baby' && gameObjectB.texture.key === 'poop')
                ) {
                    this.handleCollision(gameObjectA, gameObjectB);
                }
            });
        });
    }

    spawnPoop() {
        // Ensure only one poop is present
        if (this.poop) return;

        // Create poop
        this.poop = this.matter.add.image(this.slingshot.x, this.slingshot.y - 20, 'poop');
        this.poop.setCircle();
        this.poop.setStatic(true);
        this.poop.setInteractive();
        this.poop.setDepth(2);

        // Handle drag events
        this.poop.on('pointerdown', this.startDrag, this);
        this.input.on('pointermove', this.doDrag, this);
        this.input.on('pointerup', this.endDrag, this);

        // Listen for poop going out of bounds or coming to rest
        this.poopDisappearCheck();
    }

    startDrag(pointer) {
        this.isPulling = true;
        this.poop.setTint(0x999999);
    }

    doDrag(pointer) {
        if (!this.isPulling) return;

        // Limit the drag distance
        const maxDrag = 100;
        const dx = pointer.x - this.slingshot.x;
        const dy = pointer.y - this.slingshot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let angle = Math.atan2(dy, dx);
        let distance = Math.min(dist, maxDrag);

        // Set poop position
        this.poop.x = this.slingshot.x + Math.cos(angle) * distance;
        this.poop.y = this.slingshot.y + Math.sin(angle) * distance;

        // Update slingshot band
        this.updateSlingshotBand(this.poop.x, this.poop.y);
    }

    endDrag(pointer) {
        if (!this.isPulling) return;
        this.isPulling = false;
        this.poop.clearTint();

        // Calculate velocity based on drag distance
        const launchSpeed = 0.3; // Adjusted launch speed
        const velocityX = (this.slingshot.x - this.poop.x) * launchSpeed;
        const velocityY = (this.slingshot.y - this.poop.y) * launchSpeed;

        this.poop.setStatic(false);
        this.poop.setVelocity(velocityX, velocityY);
        this.poopsUsed++;

        // Clear slingshot band
        this.slingshotBand.clear();

        // Remove drag events to prevent multiple launches
        this.poop.disableInteractive();
    }

    updateSlingshotBand(poopX, poopY) {
        this.slingshotBand.clear();
        this.slingshotBand.lineStyle(4, 0x8B4513); // Brown color for the band
        this.slingshotBand.strokeLineShape(
            new Phaser.Geom.Line(this.slingshot.x - 10, this.slingshot.y - 30, poopX, poopY)
        );
        this.slingshotBand.strokeLineShape(
            new Phaser.Geom.Line(this.slingshot.x + 10, this.slingshot.y - 30, poopX, poopY)
        );
    }

    spawnEnemy() {
        // Ensure only one enemy is present
        if (this.enemy) return;

        // Create enemy
        this.enemy = this.matter.add.image(750, 450, 'baby');
        this.enemy.setRectangle(); // Use the image's dimensions

        // Set enemy origin to center
        this.enemy.setOrigin(0.5, 0.5);

        // Scale down the enemy to 70%
        this.enemy.setScale(0.7);

        // Disable gravity on enemy
        this.enemy.setIgnoreGravity(true);
        this.enemy.setFrictionAir(0);

        // Move enemy left towards slingshot
        this.enemy.setVelocity(-1, 0);

        // Remove enemy when it reaches the left edge
        this.enemy.setOnCollideWith(this.matter.world.walls.left, () => {
            if (this.enemy) {
                this.enemy.destroy();
                this.enemy = null; // Allow new enemy to spawn
                this.missedEnemies++;
                this.spawnEnemy();
            }
        });
    }

    handleCollision(objA, objB) {
        let enemy = objA.texture.key === 'baby' ? objA : objB;
        let poop = objA.texture.key === 'poop' ? objA : objB;

        // Enemy defeat animation
        enemy.setTint(0xff0000);
        enemy.setAngularVelocity(0.1); // Slower spin

        enemy.setVelocity(2, -2);
        enemy.setCollidesWith([]); // Disable further collisions
        this.enemiesDefeated++;

        // Add fade-out effect
        this.tweens.add({
            targets: enemy,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                if (enemy) {
                    enemy.destroy();
                    this.enemy = null; // Allow new enemy to spawn
                    this.spawnEnemy();
                }
            }
        });

        // Destroy poop immediately
        if (poop) {
            poop.destroy();
            this.poop = null; // Allow new poop to spawn
            this.spawnPoop();
        }
    }

    poopDisappearCheck() {
        this.time.addEvent({
            delay: 100,
            loop: true,
            callback: () => {
                if (!this.poop) return;

                // Check if poop is out of bounds
                if (
                    this.poop.x < -50 ||
                    this.poop.x > 850 ||
                    this.poop.y < -50 ||
                    this.poop.y > 650
                ) {
                    this.poop.destroy();
                    this.poop = null;
                    this.spawnPoop();
                }

                // Check if poop is almost stationary
                if (this.poop.body && this.poop.body.speed < 0.1 && !this.poop.isStatic()) {
                    this.poop.destroy();
                    this.poop = null;
                    this.spawnPoop();
                }
            }
        });
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 1 }, // Gravity for the poop
            debug: false,
            setBounds: true
        }
    },
    scene: [MainScene]
};

const game = new Phaser.Game(config);
