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
        this.boidsGlobales = juego.civiles;  
        this.boid = new Boid(this.radioVision, this.x, this.y, this.juego);
    }

    actualizar() {
        this.boidsGlobales = this.juego.civiles;
        this.boid.rebaño(this.boidsGlobales);
        this.boid.bordes(this.juego.areaJuego)
        this.boid.actualizar();

        // Actualizar posición según boid
        this.x = this.boid.position.x;
        this.y = this.boid.position.y;

        // Revertir dirección visual
        if (this.boid.velocity.x > 0) this.scale.x = -3;
        else this.scale.x = 3;

        this.zIndex = this.y;

        // ─── CHEQUEAR COLISIÓN CON HITBOXES ───
        if (this.juego.hitboxChori) {
            this.chequearColisionHitbox(this.juego.hitboxChori);
        }

        // CHEQUEAR COLISIÓN CON TODOS LOS FAROLES
        for (let { hitbox } of this.juego.faroles) {
            this.chequearColisionHitbox(hitbox);
        }
    }

    chequearColisionHitbox(hitbox) {
        const margen = 2; // margen para no teletransportar

        const hbLeft = hitbox.x;
        const hbRight = hitbox.x + hitbox.width;
        const hbTop = hitbox.y;
        const hbBottom = hitbox.y + hitbox.height;

        // Radio aproximado del civil (igual que jugador o un poco más chico)
        const r = 30; 

        const px = this.x;
        const py = this.y;

        // Revisar superposición AABB
        const overlapX = px + r > hbLeft && px - r < hbRight;
        const overlapY = py + r > hbTop && py - r < hbBottom;

        if (overlapX && overlapY) {
            const distTop = Math.abs((py + r) - hbTop);
            const distBottom = Math.abs((py - r) - hbBottom);
            const distLeft = Math.abs((px + r) - hbLeft);
            const distRight = Math.abs((px - r) - hbRight);

            const minDist = Math.min(distTop, distBottom, distLeft, distRight);

            if (minDist === distTop) this.y = hbTop - r - margen;
            else if (minDist === distBottom) this.y = hbBottom + r + margen;
            else if (minDist === distLeft) this.x = hbLeft - r - margen;
            else if (minDist === distRight) this.x = hbRight + r + margen;

            // Actualizar boid también
            this.boid.position.x = this.x;
            this.boid.position.y = this.y;
        }
    }
}