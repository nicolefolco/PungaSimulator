class Boid {
    constructor() {
        let angle = Math.random() * Math.PI * 2;
        this.velocity = new PIXI.Point(Math.cos(angle), Math.sin(angle));
        this.acceleration = new PIXI.Point(0, 0);
    }

    actualizar() {
        this.velocity.x += this.acceleration.x;
        this.velocity.y += this.acceleration.y;
        const speed = Math.hypot(this.velocity.x, this.velocity.y)
        const maxSpeed = 1;
        if (speed > maxSpeed){
            this.velocity.x = (this.velocity.x / speed) * maxSpeed;
            this.velocity.y = (this.velocity.y / speed) * maxSpeed;
        }
    }

}