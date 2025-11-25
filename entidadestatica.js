class entidadEstatica {
    constructor(x, y, juego) {
        this.y = y;
        this.x = x;
        this.juego = juego;
        this.container = new PIXI.Container();
    }

        render() {
    if (!this.container)
        return console.warn("entidadEstatica no tiene container");

    this.container.x = this.x;
    this.container.y = this.y;
    this.container.zIndex = this.y; 
        }
}