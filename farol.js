class Farol extends entidadEstatica {
    constructor(x, y, juego) {
    super(x, y, juego);
    this.crearSprite();
    }

    async crearSprite() {
    const textura = await PIXI.Assets.load('./farol_luz_.png');
    console.log("Textura cargada:", textura);
    this.sprite = new PIXI.Sprite(textura);
    this.sprite.anchor.set(0.5, 1);
    this.sprite.scale.set(0.7);
    this.container.addChild(this.sprite);
    this.render();
    }

}