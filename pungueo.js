class Pungueo {
    constructor(finalizado, juego) {
        this.juego = juego;
        this.container = new PIXI.Container();
        this.activo = false;
        this.uiIniciado = false;

        this.finalizado = finalizado;

        this.aciertos = 0;
        this.fallos = 0;
        this.intentos = 0;

        this.barra = null;
        this.zona = null;
        this.marcador = null;
        this.velocidad = 5;

        this.container.visible = false; 

        this.juego.uiContainer.addChild(this.container); 


    }

    async inicializarUI() {
        const barraTex = await PIXI.Assets.load('barra.png');
        
        this.barra = new PIXI.Sprite(barraTex);
        this.barra.anchor.set(0.5, 1);

        this.barra.x = 0;
        this.barra.y = 0;
        this.barra.anchor.set(0.5, 1);


        this.container.addChild(this.barra);

        // Zona verde ๋࣭ ⭑
        const zonaTex = await PIXI.Assets.load('zona_verde.png');

        this.zona = new PIXI.Sprite(zonaTex);

        this.zona.x = this.barra.x;
        this.zona.y = this.barra.y;  
        this.zona.anchor.set(0.5, 1);

        this.container.addChild(this.zona);

        // Marcador ๋࣭ ⭑
        const marcadorTex = await PIXI.Assets.load('marcador.png');

        this.marcador = new PIXI.Sprite(marcadorTex);
        this.marcador.scale.set(1.5, 2.5);
        this.marcador.anchor.set(0.5);

        this.marcador.x = this.barra.x;
        this.marcador.y = this.barra.y - 250;
        this.velocidad = 4;

        marcadorTex.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
        this.container.addChild(this.marcador);

        this.container.x = 950;
        this.container.y = 700;


    }

    handleKey = (e) => {
        if (e.key !== " ") return;  // si no se tocó la tecla espacio, no hace nada

        this.intentos++;  // cada vez que se toca el espacio, cuenta como intento

        const dentro = this.marcador.x >= this.zona.x &&
        this.marcador.x <= this.zona.x + this.zona.width;

        if (dentro) this.aciertos++;
        else this.fallos++;

        if (this.intentos >= 2) {
            this.terminar(this.aciertos >= 1 ? "Robo exitoso" : "Espantoso");
}
        
    }

    actualizar(delta) {
        if (!this.activo) return;
        if (!this.barra || !this.zona || !this.marcador) return; 
        this.moverMarcador(delta);
    }

    moverMarcador(delta) {
        const izquierda = this.barra.x - this.barra.width / 2;
        const derecha = this.barra.x + this.barra.width / 2;

        this.marcador.x += this.velocidad * delta;

        if (this.marcador.x < izquierda || this.marcador.x > derecha) {
            this.velocidad *= -1;
        }
    }

    async iniciar() {
        this.activo = false;
        this.container.visible = true;

        if (!this.uiIniciado) {
            await this.inicializarUI();   
            this.uiIniciado = true;
    }

        this.intentos = 0;
        this.aciertos = 0;
        this.fallos = 0;

        this.activo = true;
        window.addEventListener("keydown", this.handleKey);
    }

    cerrar() {
        this.activo = false;
        this.container.visible = false;
    }

    terminar(resultado) {
        window.removeEventListener("keydown", this.handleKey);
        this.finalizado(resultado);  // si es Exitoso, se suma al contador de celulares +1 . Si es Espantoso sale del minijuego. 
        this.cerrar()
    }
}