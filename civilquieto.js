class CivilQuieto extends Civil {
    constructor(frames, x, y, juego){
        super(frames, x, y, juego);
        this.boid = null;
        this.boidsGlobales = null;
        this.contenidoBurbuja = null;
    }

    actualizar() {
        this.zIndex = this.y;

        if (this.contenidoBurbuja) {  // posiciona la burbuja encima del sprite
            this.contenidoBurbuja.x = this.position.x + this.width * 0.17;
            this.contenidoBurbuja.y = this.position.y - this.height * 0.4;
            this.contenidoBurbuja.zIndex = this.zIndex + 1;
    };

    }

    mostrarBurbuja() {
        if (this.contenidoBurbuja) this.contenidoBurbuja.visible = true;
    };

    ocultarBurbuja() {
        if (this.contenidoBurbuja) this.contenidoBurbuja.visible = false
    }

}