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

        this.velocidad = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 };
        this.aceleracion = { x: 0, y: 0 };
        this.maxVel = 2;
        this.maxAcel = 0.15;

        this.radioVision = 120;
        this.radioSeparacion = 50; // distancia mínima entre boids
    }

    tick(dt) {
        // Reflejar sprite según dirección
        if (this.velocidad.x > 0) this.scale.x = -1;
        else if (this.velocidad.x < 0) this.scale.x = 1;
        this.x = Math.max(this.areaJuego.xMin, Math.min(this.x, this.areaJuego.xMax));
        this.y = Math.max(this.areaJuego.yMin, Math.min(this.y, this.areaJuego.yMax));
    }
}