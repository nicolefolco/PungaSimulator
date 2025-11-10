class Civil extends PIXI.AnimatedSprite {
    constructor(frames, x, y, juego) {
        super(frames);
        this.juego = juego;
        this.x = x;
        this.y = y;
        this.anchor.set(0.5);
        this.scale.set(1.5)
        this.animationSpeed = 0.15;
        this.play();

        this.boid = new Boid();

    }

    actualizar(dt) {
        this.boid.actualizar();
        this.x += this.boid.velocity.x;
        this.y += this.boid.velocity.y;

        if (this.boid.velocity.x > 0) this.scale.x = -1.5;
        else this.scale.x = 1.5;
    
        this.x = Math.max(this.juego.areaJuego.xMin, Math.min(this.x, this.juego.areaJuego.xMax));
        this.y = Math.max(this.juego.areaJuego.yMin, Math.min(this.y, this.juego.areaJuego.yMax));
    }

/*
    tick(dt) {
        // Reflejar sprite según dirección
        if (this.velocidad.x > 0) this.scale.x = -1;
        else if (this.velocidad.x < 0) this.scale.x = 1;
        this.x = Math.max(this.areaJuego.xMin, Math.min(this.x, this.areaJuego.xMax));
        this.y = Math.max(this.areaJuego.yMin, Math.min(this.y, this.areaJuego.yMax));
    }
*/
}