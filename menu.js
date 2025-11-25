class Menu {

    botonJugar;
    botonGuia;
    botonControles;

    constructor(juego) {
        this.juego = juego;

        // estado inicial
        this.juego.estadoActual = "menu";

        this.cargarFondoMenu();
        this.crearBotonesMenu();

        // listener global de ESC
        this._escHandler = (e) => {
            if (e.key === "Escape") {
                if (["controles", "guia", "pantallaFinal"].includes(this.juego.estadoActual)) {
                    this.volverAlMenu();
                }
            }
        };
        window.addEventListener("keydown", this._escHandler);
    }

    // cargar fondo
    async cargarFondoMenu() {
        const texturaMenu = await PIXI.Assets.load("assets/menuInicioInterfaz.png");
        const menu = new PIXI.Sprite(texturaMenu);

        menu.width = 1920;
        menu.height = 960;

        this.juego.cameraContainer.addChildAt(menu, 0);
    }

    // crear botones
    crearBotonesMenu() {
        this.botonJugar = this.crearBoton(665, 388);
        this.botonGuia = this.crearBoton(665, 546);
        this.botonControles = this.crearBoton(665, 704);

        this.botonJugar.on("pointerdown", () => this.cargarJuego());
        this.botonGuia.on("pointerdown", () => this.cargarGuia());
        this.botonControles.on("pointerdown", () => this.cargarControles());
    }

    crearBoton(x, y) {
        const boton = new PIXI.Graphics();
        this.dibujarBotonSinBorde(boton);
        boton.x = x;
        boton.y = y;
        boton.eventMode = "static";
        boton.cursor = "pointer";

        boton.on("pointerover", () => {
            boton.clear();
            boton.lineStyle(4, 0xffffff);
            boton.beginFill(0x000000, 0);
            boton.drawRect(0, 0, 588, 130);
            boton.endFill();
        });

        boton.on("pointerout", () => {
            boton.clear();
            this.dibujarBotonSinBorde(boton);
        });

        this.juego.cameraContainer.addChild(boton);
        return boton;
    }

    dibujarBotonSinBorde(unBoton) {
        unBoton.lineStyle(0);
        unBoton.beginFill(0x000000, 0);
        unBoton.drawRect(0, 0, 588, 130);
        unBoton.endFill();
    }

    async cargarJuego() {
        // al iniciar juego, reiniciamos posiciones y contenedores del menú
        this.juego.containerDelJuego.x = 0;
        this.juego.containerDelJuego.y = 0;
        this.juego.cameraContainer.x = 0;
        this.juego.cameraContainer.y = 0;

        this.juego.estadoActual = "juego";
        await this.juego.cargarJuego();

        console.log("juego abierto");
    }

    async cargarGuia() {
        this.limpiarPantalla();
        this.juego.estadoActual = "guia";

        const texturaGuia = await PIXI.Assets.load("assets/fondoGuia.png");
        const fondoGuia = new PIXI.Sprite(texturaGuia);
        fondoGuia.width = 1920;
        fondoGuia.height = 960;

        this.juego.cameraContainer.addChild(fondoGuia);
        console.log("guia abierta");
    }

    async cargarControles() {
        this.limpiarPantalla();
        this.juego.estadoActual = "controles";

        const texturaControles = await PIXI.Assets.load("assets/fondoControles.png");
        const fondoControles = new PIXI.Sprite(texturaControles);
        fondoControles.width = 1920;
        fondoControles.height = 960;

        this.juego.cameraContainer.addChild(fondoControles);
        console.log("controles abiertos");
    }

    volverAlMenu() {
        this.limpiarPantalla();

        this.juego.estadoActual = "menu";

        // reset contenedores
        this.juego.containerDelJuego.x = 0;
        this.juego.containerDelJuego.y = 0;
        this.juego.cameraContainer.x = 0;
        this.juego.cameraContainer.y = 0;

        // recargar elementos del menú
        this.cargarFondoMenu();
        this.crearBotonesMenu();

        console.log("menu cargado");
    }

    // limpiar contenedores antes de cambiar pantalla
    limpiarPantalla() {
        this.juego.containerDelJuego.removeChildren();
        this.juego.cameraContainer.removeChildren();
    }

    // opcional: remover listener de ESC al destruir menú
    destruir() {
        window.removeEventListener("keydown", this._escHandler);
    }
}