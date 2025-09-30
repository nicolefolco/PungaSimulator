class Civil extends PIXI.AnimatedSprite {
    constructor(frames, x, y, juego) {
        super(frames);
        this.juego = juego;
        this.x = x;
        this.y = y;
        this.anchor.set(0.5);
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
        this.aceleracion.x = 0;
        this.aceleracion.y = 0;

        // Separación siempre prioritaria
        const sep = this.calcularSeparacion();
        this.aceleracion.x += sep.x * 2; 
        this.aceleracion.y += sep.y * 2;

        //  Cohesión y alineación suaves
        this.cohesion();
        this.alineacion();

        //  Perseguir jugador con separación incorporada
        const perseguir = this.perseguirJugadorConSeparacion();
        this.aceleracion.x += perseguir.x;
        this.aceleracion.y += perseguir.y;

        // Limitar aceleración
        this.limitar(this.aceleracion, this.maxAcel);

        // Actualizar velocidad y posición
        this.velocidad.x += this.aceleracion.x * dt;
        this.velocidad.y += this.aceleracion.y * dt;
        this.limitar(this.velocidad, this.maxVel);

        this.x += this.velocidad.x * dt;
        this.y += this.velocidad.y * dt;

        // Reflejar sprite según dirección
        if (this.velocidad.x > 0) this.scale.x = -1;
        else if (this.velocidad.x < 0) this.scale.x = 1;
    }

    // Separación normal
    calcularSeparacion() {
        let fuerza = { x: 0, y: 0 };
        for (let otro of this.juego.civiles) {
            if (otro !== this) {
                const dx = this.x - otro.x;
                const dy = this.y - otro.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < this.radioSeparacion && dist > 0) {
                    const factor = 1 - dist / this.radioSeparacion;
                    fuerza.x += (dx / dist) * factor;
                    fuerza.y += (dy / dist) * factor;
                }
            }
        }
        return fuerza;
    }

    // Cohesión
    cohesion() {
        let centro = { x: 0, y: 0 };
        let count = 0;
        for (let otro of this.juego.civiles) {
            if (otro !== this) {
                const dx = this.x - otro.x;
                const dy = this.y - otro.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < this.radioVision) {
                    centro.x += otro.x;
                    centro.y += otro.y;
                    count++;
                }
            }
        }
        if (count > 0) {
            centro.x /= count;
            centro.y /= count;
            this.aceleracion.x += (centro.x - this.x) * 0.02;
            this.aceleracion.y += (centro.y - this.y) * 0.02;
        }
    }

    // Alineación
    alineacion() {
        let avg = { x: 0, y: 0 };
        let count = 0;
        for (let otro of this.juego.civiles) {
            if (otro !== this) {
                const dx = this.x - otro.x;
                const dy = this.y - otro.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < this.radioVision) {
                    avg.x += otro.velocidad.x;
                    avg.y += otro.velocidad.y;
                    count++;
                }
            }
        }
        if (count > 0) {
            avg.x /= count;
            avg.y /= count;
            this.aceleracion.x += (avg.x - this.velocidad.x) * 0.05;
            this.aceleracion.y += (avg.y - this.velocidad.y) * 0.05;
        }
    }

    // Perseguir jugador pero evitando pisarse
    perseguirJugadorConSeparacion() {
        const dx = this.juego.jugador.x - this.x;
        const dy = this.juego.jugador.y - this.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 300) {
            // Vector hacia jugador
            let dir = { x: dx / dist, y: dy / dist };

            // fuerza de separación para vecinos cercanos
            const sep = this.calcularSeparacion();
            dir.x += sep.x * 1.5; 
            dir.y += sep.y * 1.5;

            this.limitar(dir, 0.1); // fuerza moderada para que no domine separación
            return dir;
        }
        return { x: 0, y: 0 };
    }

    limitar(vec, max) {
        const mag = Math.sqrt(vec.x*vec.x + vec.y*vec.y);
        if (mag > max) {
            vec.x = (vec.x / mag) * max;
            vec.y = (vec.y / mag) * max;
        }
    }
}
