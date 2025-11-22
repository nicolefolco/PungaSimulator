class Vector extends PIXI.Point {  // el vector indica qué tan larga es la flecha de dirección
    add(v) {  
        this.x += v.x; // combina direcciones, devuelve el mismo vector modificado
        this.y += v.y;
        return this;
    }

    sub(v) {    // resta otro vector con este vector, obtiene la diferencia de dirección 
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    div(n) {
        this.x /= n; // para promediar, ajustar fuerza, reducir un vector...
        this.y /= n;
        return this;
    }

    mult(n) {  // para multiplicar el vector por un número 
        this.x *= n;
        this.y *= n;
        return this;
    }

        mag() {  // longitud del vector, "tamaño de la flecha", teorema de pitágoras
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }    

    normalize() {  // convierte el vector en uno de longitud 1 manteniendo la misma dirección
        const m = this.mag();  // saca cuántas unidades tiene la magnitud
        if (m !== 0) {
            this.x /= m;
            this.y /= m;
        }
        return this;
    }

    set(x,y) {
        this.x = x;
        this.y = y;
        return this;
    }

        setMag(m) {  // cambia la longitud del vector, mismo ángulo, nuevo tamaño ⋆.˚✮
        this.normalize();
        this.mult(m);
        return this;
    }

    static dist(a,b) {   // funcion estática, no necesita un objeto para existir.
        return Math.hypot(a.x - b.x, a.y - b.y);  // calcula la distancia entre dos puntos
    }

    limit(max) { // si la magnitud es mayor que el máximo, la achica para que sea exactamente max.
        const m = this.mag();

        if (m > max) {
            this.setMag(max);
        }

        return this;
    }

}

// ≽^• Atajo • ྀི≼

function createVector(x = 0, y = 0) {
    return new Vector(x, y);
}