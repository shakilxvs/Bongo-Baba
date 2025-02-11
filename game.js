class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
        this.maxPoops = 6;
        this.poopsUsed = 0;
        this.currentEnemies = 0;
        this.maxEnemies = 5;
        this.enemiesDefeated = 0;
        this.missedEnemies = 0;
    }

    preload() {
        this.load.image('background', 'https://cdn.shopify.com/s/files/1/0919/6814/3645/files/background.png?v=1739296210');
        this.load.image('poop', 'https://cdn.shopify.com/s/files/1/0919/6814/3645/files/poop.png?v=1739296208');
        this.load.image('baby', 'https://cdn.shopify.com/s/files/1/0919/6814/3645/files/baby_enemy.png?v=1739296208');
        this.load.image('slingshot', 'https://cdn.shopify.com/s/files/1/0919/6814/3645/files/slingshot.png?v=1739296208');
    }

    create() {
        this.add.image(400, 300, 'background');
        this.slingshot = this.add.image(150, 450, 'slingshot').setDepth(1);
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
                        this.enemiesDefeated++;
                        this.spawnPoop();
                        this.spawnEnemy();
                    }
                });
            }
        });
    }

    spawnPoop() {
        if (this.poopsUsed >= this.maxPoops) return;
        this.poopsUsed++;
        this.poop = this.matter.add.image(150, 450, 'poop');
        this.poop.setCircle(20);
        this.poop.setStatic(true);
        this.poop.setInteractive();
        this.poop.once('pointerdown', () => this.launchPoop());
    }

    launchPoop() {
        if (!this.poop) return;
        this.poop.setStatic(false);
        this.poop.setVelocity(10, -10);
        this.time.delayedCall(1500, () => this.spawnPoop(), [], this);
    }

    spawnEnemy() {
        if (this.currentEnemies >= this.maxEnemies) {
            this.checkGameResult();
            return;
        }

        this.currentEnemies++;
        let enemy = this.matter.add.image(800, 450, 'baby');
        enemy.setRectangle(50, 50);
        enemy.setStatic(false);
        this.enemies.push(enemy);

        let moveInterval = this.time.addEvent({
            delay: 100,
            loop: true,
            callback: (t) => {
                if (t && enemy && this.enemies.includes(enemy)) {
                    enemy.setVelocity(-1, 0);
                }
            }
        });

        this.time.delayedCall(6000, () => {
            if (this.enemies.includes(enemy)) {
                enemy.destroy();
                this.enemies.shift();
                this.missedEnemies++;
                this.checkGameResult();
            }
        }, [], this);
    }

    checkGameResult() {
        if (this.missedEnemies >= 3) {
            alert("Game Over! You failed.");
            this.scene.restart();
        } else if (this.enemiesDefeated >= 3) {
            let stars = this.getStarCount();
            alert(`You win! Stars earned: ${stars}`);
            this.scene.start('Level2Scene');
        }
    }

    getStarCount() {
        if (this.enemiesDefeated === 3) return 1;
        if (this.enemiesDefeated === 4) return 2;
        if (this.enemiesDefeated === 5) return 3;
        return 0;
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
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
