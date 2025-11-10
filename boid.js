class Boid {
    constructor() {
        let angle = Math.random() * Math.PI * 2;

        this.velocity = new PIXI.Point(Math.cos(angle), Math.sin(angle));
        setMag(this.velocity, random(0.5, 1.5));
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

    alinear(boids){
        let avg = createVector(); // cambiar
        for (let otro of boids) {  
            avg.add(other.velocity);  // adaptar
        }
    avg.div(boids)
    }

}

    function setMag(vec, m) {
        let mag = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
        if (mag !== 0) {
            vec.x = (vec.x / mag) * m;
            vec.y = (vec.y / mag) * m;
        }
    }

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }
