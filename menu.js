class Menu {

    botonJugar;
    botonGuia;
    botonControles;

    constructor(juego) {
        this.juego = juego;

        // estado inicial, se inicializa en menú
        this.juego.estadoActual = "menu";

        this.cargarFondoMenu();
        this.crearBotonesMenu();

        // cuando se apreta la tecla ESC mientras estamos en controles, guía o juego, se vuelve al menú principal
        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                if (this.juego.estadoActual === "controles" ||
                    this.juego.estadoActual === "guia" /*||
                    this.juego.estadoActual === "juego"*/) {

                    this.volverAlMenu();
                }
            }
        });
    }

    // función para cargar el fondo del menú
    async cargarFondoMenu() {
        const texturaMenu = await PIXI.Assets.load("assets/menuInicioInterfaz.png");
        const menu = new PIXI.Sprite(texturaMenu);

        menu.width = 1920;
        menu.height = 960;

        this.juego.containerDelJuego.addChildAt(menu, 0);
    }

    // función para crear los tres botones del menú con sus respectivas funciones cuando se hace click en ellos
    crearBotonesMenu() {

        this.botonJugar = this.crearBoton(665, 388);
        this.botonGuia = this.crearBoton(665, 546);
        this.botonControles = this.crearBoton(665, 704);

        this.botonJugar.on("pointerdown", () => this.cargarJuego());
        this.botonGuia.on("pointerdown", () => this.cargarGuia());
        this.botonControles.on("pointerdown", () => this.cargarControles());
    }

    // función para crear un botón
    crearBoton(x, y) {

        const boton = new PIXI.Graphics();

        this.dibujarBotonSinBorde(boton);

        boton.x = x;
        boton.y = y;

        boton.eventMode = "static";
        boton.cursor = "pointer";

        // cuando se pasa el cursor por encima del botón, se borra el actual y se dibuja el mismo pero con el borde blanco
        boton.on("pointerover", () => {
            boton.clear();
            boton.lineStyle(4, 0xffffff); // borde blanco para generar el efecto cuando pasamos el cursor encima
            boton.beginFill(0x000000, 0); // es transparente así se puede ver el botón original del fondo
            boton.drawRect(0, 0, 588, 130);
            boton.endFill();
        });

        // cuando sacamos el cursor del botón, se borra el botón con borde blanco y se vuelve a dibujar sin el borde
        boton.on("pointerout", () => {
            boton.clear();
            this.dibujarBotonSinBorde(boton);
        });

        this.juego.containerDelJuego.addChild(boton);
        return boton;
    }

    // función para dibujar un botón invisible sin borde
    dibujarBotonSinBorde(unBoton) {
        unBoton.lineStyle(0);
        unBoton.beginFill(0x000000, 0); // es transparente así se puede ver el botón original del fondo
        unBoton.drawRect(0, 0, 588, 130);
        unBoton.endFill();
    }

    // función para cargar el juego, por el momento debugging porque juego responde en el propio juego.js
    async cargarJuego() {

        this.juego.containerDelJuego.removeChildren();

        this.juego.estadoActual = "juego";

        this.juego.cargarJuego()

        /*
        // cargar fondo de juego
        const texturaJuego = await PIXI.Assets.load("assets/fondoJuego.jpg");
        const fondoJuego = new PIXI.Sprite(texturaJuego);
        fondoJuego.width = 1920;
        fondoJuego.height = 960;

        this.juego.containerDelJuego.addChild(fondoJuego);
        */

        console.log("juego abierto");
    }

    // función para cargar la pantalla de guía del juego
    async cargarGuia() {

        // se borran todos los elementos en pantalla
        this.juego.containerDelJuego.removeChildren();

        this.juego.estadoActual = "guia";

        // se carga el fondo de guía
        const texturaGuia = await PIXI.Assets.load("assets/fondoGuia.jpg");
        const fondoGuia = new PIXI.Sprite(texturaGuia);
        fondoGuia.width = 1920;
        fondoGuia.height = 960;

        this.juego.containerDelJuego.addChild(fondoGuia);

        console.log("guia abierta");
    }

    // función para cargar la pantalla de controles del juego
    async cargarControles() {

        // se borran todos los elementos en pantalla
        this.juego.containerDelJuego.removeChildren();

        this.juego.estadoActual = "controles";

        // se carga el fondo de controles
        const texturaControles = await PIXI.Assets.load("assets/fondoControles.jpg");
        const fondoControles = new PIXI.Sprite(texturaControles);
        fondoControles.width = 1920;
        fondoControles.height = 960;

        this.juego.containerDelJuego.addChild(fondoControles);

        console.log("controles abiertos");
    }

    // función para volver al menú inicial
    volverAlMenu() {

        // se borran todos los elementos en pantalla
        this.juego.containerDelJuego.removeChildren();

        this.juego.estadoActual = "menu";
        
        // se vuelve a cargar el menú con sus elementos correspondientes
        this.cargarFondoMenu();
        this.crearBotonesMenu();

        console.log("menu cargado");
    }
}