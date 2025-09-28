class Civil extends GameObject {
    constructor(texture, x, y, juego){
        super(texture, x, y, juego);
    }

    getOtrosCiviles() {
        return this.juego.civiles;
    }
}

// clase para acceder a la lista de los civiles. 