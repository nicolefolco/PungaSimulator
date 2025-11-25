class Boid {
    constructor(radioVision, x, y, juego) {
        let angle = Math.random() * Math.PI * 2;

        this.position = new Vector(x, y)
        this.velocity = new Vector(Math.cos(angle), Math.sin(angle));
        this.velocity.setMag(random(2, 4));
        this.acceleration = createVector();
        this.radioVision = radioVision;
        this.fuerzaMax = 0.08;
        this.velMax = 3;
        this.width = juego.width
        this.height = juego.height
        this.juego = juego
    }


    bordes() {
        let margen = 0.9;       // distancia desde el borde para empezar a girar
        let fuerza = 0.1;      // cuánto los empuja hacia adentro

        let steer = createVector(0, 0);

        if (this.position.x < this.juego.areaJuego.xMin + margen) {
        steer.x = fuerza;
        }
        else if (this.position.x > this.juego.areaJuego.xMax - margen) {
        steer.x = -fuerza;
        }

        if (this.position.y < this.juego.areaJuego.yMin + margen) {
        steer.y = fuerza;
        }
        else if (this.position.y > this.juego.areaJuego.yMax - margen) {
        steer.y = -fuerza;
        }

        return steer;
    }

    actualizar() {
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.velMax);
        this.acceleration.set(0, 0);
    }

    alinear(boids){    // alinear la velocidad promedio de los boids ִֶָ𓂃 ࣪˖ ִֶָ🐇་༘࿐
        let fuerzaGuia = createVector(); 
        let total = 0;

        for (let otro of boids) {  
            if (otro.boid === this) continue;

            let d = Vector.dist(this.position, otro.boid.position);

            if (d < this.radioVision) { 
            fuerzaGuia.add(otro.boid.velocity);  // sumar velocidad del otro boid
            total ++;
        }
    }

        if (total > 0) {
            fuerzaGuia.div(total);
            fuerzaGuia.setMag(this.velMax);
            fuerzaGuia.sub(this.velocity);  
            fuerzaGuia.limit(this.fuerzaMax);
        }
    

        return fuerzaGuia;    // Fuerza = aceleración ; Aceleración = fuerza

}

    cohesionar(boids){    // los boids iran al centro de masa de los otros ִִֶֶָָ. ..𓂃 ࣪ ִֶָ🦋་༘࿐
        let fuerzaGuia = createVector(); 
        let total = 0;

        for (let otro of boids) {  
            if (otro.boid === this) continue;


            let d = Vector.dist(this.position, otro.boid.position);

            if (d < this.radioVision) { 
            fuerzaGuia.add(otro.boid.position);  
            total ++;
        }
    }

        if (total > 0) {
            fuerzaGuia.div(total);
            fuerzaGuia.sub(this.position); // vector va hacia -> ubicación promedio
            fuerzaGuia.setMag(this.velMax);
            fuerzaGuia.sub(this.velocity);  
            fuerzaGuia.limit(this.fuerzaMax);
        }
    

        return fuerzaGuia;    // Fuerza = aceleración ; Aceleración = fuerza

}

    separar(boids) {  // los boids se apartan de los boids cercanos ୧ ‧₊˚ 🍮 ⋅ ☆
        let fuerzaGuia = createVector(); 
        let total = 0;

        for (let otro of boids) {  
            if (otro.boid === this) continue;


            let distancia = Vector.dist(this.position, otro.boid.position);

            if (distancia < this.radioVision && distancia > 0) { 
            let diferencia = createVector(
                this.position.x - otro.boid.position.x,
                this.position.y - otro.boid.position.y
            );

            diferencia.normalize(); // cuanto más lejos está, menos va a empujar
            diferencia.div(distancia);
            fuerzaGuia.add(diferencia);  
            total++;
            }
        }

        if (total > 0) {
            fuerzaGuia.div(total);
            fuerzaGuia.setMag(this.velMax);
            fuerzaGuia.sub(this.velocity);  
            fuerzaGuia.limit(this.fuerzaMax);
        }
    
        return fuerzaGuia; 
    
    }

    rebaño(boids) {  
        let borde = this.bordes();
        let alineacion = this.alinear(boids);
        let cohesion = this.cohesionar(boids);
        let separacion = this.separar(boids);

        separacion.mult(3)
        alineacion.mult(2)
        cohesion.mult(1)

        this.acceleration.add(borde);
        this.acceleration.add(separacion)
        this.acceleration.add(alineacion);      // Aplica fuerza a la aceleración 
        this.acceleration.add(cohesion);
    }

}

// °❀⋆.ೃ࿔*:  Funciones  ･°❀⋆.ೃ࿔*:･

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }
