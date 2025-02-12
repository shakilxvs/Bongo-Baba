class EnemyManager {
    constructor(scene) {
        this.scene = scene;
        this.spawnEnemy();
    }

    spawnEnemy() {
        let enemy = this.scene.matter.add.image(this.scene.scale.width, this.scene.scale.height * 0.75, 'enemy');
        enemy.setRectangle(50, 50).setStatic(false).setScale(0.7);
        enemy.setData('isEnemy', true);
        enemy.setVelocity(-3, 0); // Move left
    }
}