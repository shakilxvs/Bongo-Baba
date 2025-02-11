class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    preload() {
        // Load images from external URLs
        this.load.image('background', 'https://cdn.shopify.com/s/files/1/0919/6814/3645/files/background.png?v=1739296210');
        this.load.image('poop', 'https://cdn.shopify.com/s/files/1/0919/6814/3645/files/poop.png?v=1739296208');
        this.load.image('baby', 'https://cdn.shopify.com/s/files/1/0919/6814/3645/files/baby_enemy.png?v=1739296208');
        this.load.image('slingshot', 'https://cdn.shopify.com/s/files/1/0919/6814/3645/files/slingshot.png?v=1739296208');
    }

    create() {
        this.updateCanvasSize();

        // Add background and make it fullscreen
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // Add slingshot and align properly
        this.slingshot = this.add.image(150, this.cameras.main.height - 150, 'slingshot').setDepth(1);

        this.poop = null;
        this.spawnPoop();

        this.enemies = [];
        this.spawnEnemy();

        this.matter.world.on('collisionstart', (event, bodyA, bodyB) => {
            let poop = bodyA.gameObject || bodyB.gameObject;
            let enemy = bodyA.gameObject && bodyA.gameObject.texture.key === 'baby' ? bodyA.gameObject :
                        bodyB.gameObject && bodyB.gameObject.texture.key === 'baby' ? bodyB.gameObject : null;

            if (poop && enemy) {
                this.tweens.add({
                    targets: [poop, enemy],
                    alpha: 0,
                    duration: 500,
                    onComplete: () => {
                        poop.destroy();
                        enemy.destroy();
                    }
                });
            }
        });

        window.addEventListener('resize', () => this.updateCanvasSize());
    }

    updateCanvasSize() {
        this.scale.resize(window.innerWidth, window.innerHeight);
    }

    spawnPoop() {
        this.poop = this.matter.add.image(150, this.cameras.main.height - 150, 'poop');
        this.poop.setCircle(20);
        this.poop.setStatic(true);

        this.poop.setInteractive();
        this.poop.once('pointerdown', () => this.launchPoop());
    }

    launchPoop() {
        this.poop.setStatic(false);
        this.poop.setVelocity(10, -10);
    }

    spawnEnemy() {
        let enemy = this.matter.add.image(this.cameras.main.width - 50, this.cameras.main.height - 150, 'baby');
        enemy.setRectangle(50, 50);
        enemy.setStatic(false);
    }
}

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 1 },
            debug: false
        }
    },
    scene: [MainScene]
};

const game = new Phaser.Game(config);
