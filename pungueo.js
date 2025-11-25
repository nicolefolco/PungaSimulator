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
        this.marcVelocidad = 12;

        this.container.visible = false; 

        this.container.x = 950;
        this.container.y = 700;

        this.juego.hudContainer.addChild(this.container); 

        this.inicializada = false;
        this.inicializarUI().then(() => {     // el constructor lanza la carga y .then() marca cuando terminó, sin bloquear la creación del objeto. Solucionó el movimiento del marcador
        this.inicializada = true;
        });
    }

    async inicializarUI() {
        const barraTex = await PIXI.Assets.load('assets/barra.png');
        
        this.barra = new PIXI.Sprite(barraTex);

        this.barra.x = 0;
        this.barra.y = 0;
        this.barra.anchor.set(0.5, 1);


        this.container.addChild(this.barra);

        // Zona verde ๋࣭ ⭑
        const zonaTex = await PIXI.Assets.load('assets/zona_verde_1.png');

        this.zona = new PIXI.Sprite(zonaTex);

        this.zona.x = this.barra.x - 150;
        this.zona.y = this.barra.y - 192;  
        this.zona.anchor.set(0.5, 1);

        this.container.addChild(this.zona);

        

        // Marcador ๋࣭ ⭑
        const marcadorTex = await PIXI.Assets.load('assets/marcador.png');

        this.marcador = new PIXI.Sprite(marcadorTex);
        this.marcador.scale.set(1.5, 2.5);
        this.marcador.anchor.set(0.5);


        this.marcador.x = this.barra.x;
        this.marcador.y = this.barra.y - 250;

        marcadorTex.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
        this.container.addChild(this.marcador);

    }

    handleKey = (e) => {
        if (e.key !== " ") return;  // si no se tocó la tecla espacio, no hace nada

        this.intentos++;  // cada vez que se toca el espacio, cuenta como intento
        
         const zonaBounds = this.zona.getBounds();       // PIXI.Rectangle con x, y, width, height
        const marcadorPos = this.marcador.getGlobalPosition();

        const dentro = (
            marcadorPos.x >= zonaBounds.x &&
            marcadorPos.x <= zonaBounds.x + zonaBounds.width &&
            marcadorPos.y >= zonaBounds.y &&
            marcadorPos.y <= zonaBounds.y + zonaBounds.height
        );
        


        if (dentro) this.aciertos++;
        else this.fallos++;

        if (this.intentos == 3) {
            this.terminar(this.aciertos >= 2 ? "Robo exitoso" : "Espantoso");
}
        
    }

    actualizar() {
        if (!this.activo) return;
        if (!this.inicializada) return;
        if (!this.barra || !this.zona || !this.marcador) return;
        this.moverMarcador();
    }

    moverMarcador() {
        const izquierda = this.barra.x - this.barra.width / 2;
        const derecha = this.barra.x + this.barra.width / 2;

        this.marcador.x += this.marcVelocidad;

        if (this.marcador.x < izquierda || this.marcador.x > derecha) {
            this.marcVelocidad *= -1;
    }

    }

    async iniciar() {
        this.activo = false;
        this.container.visible = true;

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

        if (resultado === "Robo exitoso") {
            this.juego.sumarExito();  
    }
        this.finalizado(resultado);  // si es Exitoso, se suma al contador de celulares +1 . Si es Espantoso sale del minijuego. 
        this.cerrar()
    }
}