class Civil extends PIXI.AnimatedSprite {
    constructor(frames, x, y, juego) {
        super(frames);
        this.juego = juego;
        this.x = x;
        this.y = y;
        this.anchor.set(0.5);
        this.scale.set(3);
        this.animationSpeed = 0.15;
        this.play();
        this.radioVision = 20;
        this.boidsGlobales = juego.civiles;  // lista de civiles, no boids
        this.boid = new Boid(this.radioVision, this.x, this.y, this.juego);

    }

    actualizar() {
        this.boidsGlobales = this.juego.civiles;
        this.boid.rebaño(this.boidsGlobales);
        this.boid.bordes(this.juego.areaJuego)
        this.boid.actualizar();


        this.x = this.boid.position.x;  //  ⌞ El sprite sigue la posición del boid ⌝
        this.y = this.boid.position.y;

        if (this.boid.velocity.x > 0) this.scale.x = -3;  // dar vuelta sprite (visual) ✿ ⋆⭒˚.⋆
        else this.scale.x = 3;

    }


}