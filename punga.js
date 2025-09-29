class Punga extends GameObject {
    constructor(texture, x, y, juego){
        super(texture, x, y, juego);
    }

    getOtrosPungas() {
        return this.juego.pungas;
    }
}