class Juego {

    app;
    width;
    height;
    estadoActual;
    jugador;
    velocidad = 0.007;
    mouseX = 0;      
    mouseY = 0;
    civiles = [];
    civilesQuietos = [];
    objetos = [];
    pungueo= null;
    pantallaFinalMostrada = false; // flag para pantalla final

    // referencias a listeners y ticker
    _mousemoveHandler;
    _keydownHandler;
    ticker;

    constructor() {
        this.width = 15360;
        this.height = 1080;
        this.iniciarPIXI();
    }

    async iniciarPIXI() {
        await PIXI.Assets.load('assets/Pix32.ttf');
        this.app = new PIXI.Application();
        globalThis.__PIXI_APP__ = this.app;

        await this.app.init({
            background: "#3f505e",
            width: 1920,
            height: 960
        });

        document.body.appendChild(this.app.canvas);

        this.containerDelJuego = new PIXI.Container();
        this.app.stage.addChild(this.containerDelJuego);

        this.cameraContainer = new PIXI.Container();
        this.app.stage.addChild(this.cameraContainer);

        this.cargarMenu();
    }

    cargarMenu() {
        this.menu = new Menu(this);
    }

    async cargarJuego() {

        // 🔹 Detener y limpiar ticker + event listeners antiguos
        if (this.ticker) {
            this.app.ticker.remove(this.ticker);
            this.ticker = null;
        }
        if (this._mousemoveHandler) window.removeEventListener("mousemove", this._mousemoveHandler);
        if (this._keydownHandler) window.removeEventListener("keydown", this._keydownHandler);

        // 🔹 Limpiar contenedores y arrays
        this.containerDelJuego.removeChildren();
        this.cameraContainer.removeChildren();
        this.civiles = [];
        this.civilesQuietos = [];
        this.objetos = [];
        this.pungueo = null;
        this.pantallaFinalMostrada = false;

        // 🔹 Resetear estado y áreas de juego
        this.estadoActual = "juego";
        this.areaJuego = {
            xMin: 0,
            xMax: this.width,
            yMin: 350,
            yMax: this.height - 300
        };

        // 🔹 Cargar todos los elementos del juego
        await this.cargarFondoJuego();
        this.cargarHUD();
        await this.cargarCiviles();
        await this.cargarJugador();
        await this.cargarObjetosEstaticos();

        // 🔹 Guardar y agregar event listeners
        this._mousemoveHandler = (e) => {
            const rect = this.app.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        };
        window.addEventListener("mousemove", this._mousemoveHandler);

        this._keydownHandler = (e) => {
            if (e.repeat) return;

            // pungueo
            if (e.key === "f" || e.key === "F") {
                const civilQuietoCercano = this.getCivilQuietoCercano(this.jugador.rangoVisual);
                if (civilQuietoCercano) {
                    if (!this.pungueo) {
                        this.pungueo = new Pungueo((resultado) => {
                            console.log("Resultado:", resultado);
                        }, this);
                    }
                    this.pungueo.iniciar();
                }
            }

            // ESC en pantalla final
            if (e.key === "Escape") {
                if (this.estadoActual === "pantallaFinal") {
                    this.menu.volverAlMenu();
                }
            }
        };
        window.addEventListener("keydown", this._keydownHandler);

        // 🔹 Iniciar ticker
        this.ticker = () => this.gameLoop();
        this.app.ticker.add(this.ticker);

        console.log("juego abierto");
    }

    async cargarFondoJuego() {
        const fondoJuegoTextura = await PIXI.Assets.load("assets/fondoEstacionTren.jpg");
        const fondoJuego = new PIXI.Sprite(fondoJuegoTextura);
        fondoJuego.width = this.width;
        fondoJuego.height = this.height;
        this.containerDelJuego.addChildAt(fondoJuego, 0);
    }

    cargarHUD() {
        this.hudContainer = new PIXI.Container();
        this.cameraContainer.addChild(this.hudContainer);

        this.cargarContadorExitos();
        this.cargarCartelContador();
        this.cargarContador();
    }

    async cargarContadorExitos() {
        const cx = 1100 / 1920;
        const cy = 810 / 960;

        this.contadorExitos = 0;
        this.textoExitos = new PIXI.Text({
            text: "0",
            style: {
                fill: "white",
                fontSize: 48,
                fontFamily: "Pix32"
            }
        });
        this.textoExitos.x = this.app.screen.width * cx;
        this.textoExitos.y = this.app.screen.height * cy;
        this.hudContainer.addChild(this.textoExitos);
    }

    sumarExito() {
        this.contadorExitos++;
        this.textoExitos.text = `${this.contadorExitos}`;
    }

    async cargarCartelContador() {
        const texturaCartelContador = await PIXI.Assets.load("assets/int_contador.png");
        const px = 490 / 1920;
        const py = 580 / 960;

        this.cartelContador = new PIXI.Sprite(texturaCartelContador);
        this.cartelContador.x = this.app.screen.width * px;
        this.cartelContador.y = this.app.screen.height * py;
        this.cartelContador.scale.set(0.9);

        this.hudContainer.addChildAt(this.cartelContador, 0);
    }

    cargarContador() {
        const tx = 820 / 1920;
        const ty = 802 / 960;

        this.tiempoRestante = 120; // segundos

        this.textoTiempo = new PIXI.Text({
            text: "02:00",
            style: {
                fill: "white",
                fontSize: 62,
                fontFamily: "Pix32"
            }
        });

        this.textoTiempo.x = this.app.screen.width * tx;
        this.textoTiempo.y = this.app.screen.height * ty;

        this.hudContainer.addChild(this.textoTiempo);
    }

    async cargarObjetosEstaticos() {
        const farolTextura = await PIXI.Assets.load('assets/farol_luz_.png');
        this.faroles = [];

        const farolOriginal = await this.generarFarol(8000, 650, farolTextura);
        this.faroles.push(farolOriginal);

        const minDistancia = 500;
        const maxIntentos = 50;

        for (let i = 0; i < 10; i++) {
            let x;
            let intentos = 0;
            let valido = false;

            while (!valido && intentos < maxIntentos) {
                x = this.areaJuego.xMin + Math.random() * (this.areaJuego.xMax - this.areaJuego.xMin);
                valido = true;

                for (let f of this.faroles) {
                    if (Math.abs(f.sprite.x - x) < minDistancia) {
                        valido = false;
                        break;
                    }
                }

                intentos++;
            }

            const farolExtra = await this.generarFarol(x, 650, farolTextura);
            this.faroles.push(farolExtra);
        }

        const choripaneriaTextura = await PIXI.Assets.load("assets/choripaneria.png");
        this.choripaneria = new PIXI.Sprite(choripaneriaTextura);
        this.choripaneria.anchor.set(0.5);
        this.choripaneria.scale.set(1.5);
        this.choripaneria.x = 4782;
        this.choripaneria.y = 540;
        this.choripaneria.zIndex = this.choripaneria.y + 40;
        this.layerEntidades.addChild(this.choripaneria);

        const hitbox = new PIXI.Graphics();
        hitbox.beginFill(0x000000, 0);
        hitbox.drawRect(0, 0, 1010, 30);
        hitbox.endFill();
        hitbox.x = 4288;
        hitbox.y = 530;
        this.containerDelJuego.addChild(hitbox);
        this.hitboxChori = hitbox;
    }

    async generarFarol(x, y, textura) {
        const farol = new PIXI.Sprite(textura);
        farol.anchor.set(0.5);
        farol.scale.set(0.7);
        farol.x = x;
        farol.y = y;
        farol.zIndex = y + 60;

        this.layerEntidades.addChild(farol);

        const hitbox = new PIXI.Graphics();
        hitbox.beginFill(0x000000, 0);
        hitbox.drawRect(0, 0, 42, 5);
        hitbox.endFill();
        hitbox.x = x - 28;
        hitbox.y = y + 60;
        this.containerDelJuego.addChild(hitbox);

        return { sprite: farol, hitbox };
    }

    async cargarCiviles() {
        this.layerCiviles = new PIXI.Container();
        this.layerCiviles.sortableChildren = true;
        this.containerDelJuego.addChild(this.layerCiviles);

        this.layerEntidades = new PIXI.Container();
        this.layerEntidades.sortableChildren = true;
        this.containerDelJuego.addChild(this.layerEntidades);

        const sheet = await PIXI.Assets.load('assets/civiltexture.json');
        const framesCivil = [];

        for (let i = 1; i <= 10; i++) {
            framesCivil.push(sheet.textures[`caminarIzquierda_Normal (${i}).png`]);
        }

        for (let i = 0; i < 300; i++) {
            const x = Math.random() * this.width;
            const y = random(this.areaJuego.yMin, this.areaJuego.yMax);
            const civil = new Civil(framesCivil, x, y, this);

            this.layerCiviles.addChild(civil);
            this.layerEntidades.addChild(civil);
            this.civiles.push(civil);
        }

        for (let i = 1; i <= 10; i++) {
            const tex = sheet.textures[`caminarIzquierda_Normal (${i}).png`];
            tex.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
            framesCivil.push(tex);
        }

        this.layerCivilesQuietos = new PIXI.Container();
        this.layerCivilesQuietos.sortableChildren = true;
        this.containerDelJuego.addChild(this.layerCivilesQuietos);

        const spriteQuieto = await PIXI.Assets.load('assets/tipo_1.json');
        const framesCivilQuieto = [];
        const texturaBurbuja = await PIXI.Assets.load('assets/burbuja_f.png');

        for (let i = 1; i <= 3; i++) {
            framesCivilQuieto.push(spriteQuieto.textures[`tipo_1_idle (${i}).png`]);
        }

        for (let i = 0; i < 25; i++) {
            const x = Math.random() * this.width;
            const y = random(this.areaJuego.yMin, this.areaJuego.yMax);
            const civilquieto = new CivilQuieto(framesCivilQuieto, x, y, this);
            civilquieto.animationSpeed = 0.05;

            const burbuja = new PIXI.Sprite(texturaBurbuja)
            burbuja.anchor.set(0.5);
            burbuja.scale.set(1);
            burbuja.visible = false;
            civilquieto.contenidoBurbuja = burbuja;

            this.layerCivilesQuietos.addChild(civilquieto);
            this.layerEntidades.addChild(burbuja);
            this.layerEntidades.addChild(civilquieto);
            this.civilesQuietos.push(civilquieto);
        }

        for (let i = 1; i <= 3; i++) {
            const texturaQuieto = spriteQuieto.textures[`tipo_1_idle (${i}).png`];
            texturaQuieto.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
            framesCivilQuieto.push(texturaQuieto);
        }
    }

    async cargarJugador() {
        this.layerJugador = new PIXI.Container();
        this.layerJugador.sortableChildren = true;
        this.containerDelJuego.addChild(this.layerJugador);

        const pagina = await PIXI.Assets.load('assets/jugador.json');
        const frames = [];

        for (let i = 1; i <= 10; i++) {
            frames.push(pagina.textures[`caminando_izq (${i}).png`]);
        }

        this.jugador = new PIXI.AnimatedSprite(frames);
        this.jugador.anchor.set(0.5);
        this.jugador.scale.set(3);
        this.jugador.rangoVisual = 100;
        this.jugador.x = this.width / 2;
        this.jugador.y = this.height / 2;
        this.jugador.animationSpeed = 0.15;
        this.jugador.play();

        this.layerJugador.addChild(this.jugador);
        this.layerEntidades.addChild(this.jugador);

        for (let i = 1; i <= 10; i++) {
            const tex = pagina.textures[`caminando_izq (${i}).png`];
            tex.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
            frames.push(tex);
        }
    }

    getCivilQuietoCercano(distMax) {
        for (let civil of this.civilesQuietos) {
            const d = Vector.dist(civil.position, this.jugador.position);
            if (d < distMax) return civil;
        }
        return null;
    }

    async mostrarPantallaFinal() {
        if (this.pantallaFinalMostrada) return;
        this.pantallaFinalMostrada = true;

        this.estadoActual = "pantallaFinal";

        //this.celularesRobados = this.contadorExitos;

        // Detener ticker y limpiar listeners
        if (this.ticker) {
            this.app.ticker.remove(this.ticker);
            this.ticker = null;
        }
        if (this._mousemoveHandler) window.removeEventListener("mousemove", this._mousemoveHandler);
        if (this._keydownHandler) window.removeEventListener("keydown", this._keydownHandler);

        // Limpiar contenedores
        this.containerDelJuego.removeChildren();
        this.cameraContainer.removeChildren();

        // Cargar textura final
        const finalTextura = await PIXI.Assets.load("assets/pantallaFinal.png");
        this.pantallaFinal = new PIXI.Sprite(finalTextura);
        this.pantallaFinal.width = 1920;
        this.pantallaFinal.height = 960;
        this.cameraContainer.addChild(this.pantallaFinal);

        console.log("pantalla final abierto");

        this.textoCelularesRobados = new PIXI.Text(
            `Celulares robados: ${this.contadorExitos}`, // <-- todo en un string
            {
                fill: "white",
                fontSize: 150,
                fontFamily: "Pix32",
                align: "center"
            }
        );

        // Posicionar texto en pantalla
        this.textoCelularesRobados.anchor.set(0.5); // centra el texto
        this.textoCelularesRobados.x = this.app.screen.width / 2;
        this.textoCelularesRobados.y = this.app.screen.height / 2;

        this.cameraContainer.addChild(this.textoCelularesRobados);
    }

    gameLoop() {
        const dt = this.app.ticker.deltaMS / 16.67;

        const pungueoActivo = this.pungueo && this.pungueo.activo;

        if (!pungueoActivo) {
            const worldMouseX = this.mouseX - this.containerDelJuego.x;
            const worldMouseY = this.mouseY - this.containerDelJuego.y;

            const dx = worldMouseX - this.jugador.x;
            const dy = worldMouseY - this.jugador.y;

            this.jugador.x += dx * this.velocidad * dt;
            this.jugador.y += dy * this.velocidad * dt;
            this.jugador.zIndex = this.jugador.y;

            if (dx > 0) this.jugador.scale.x = -3;
            else if (dx < 0) this.jugador.scale.x = 3;

            this.jugador.x = Math.max(this.areaJuego.xMin, Math.min(this.jugador.x, this.areaJuego.xMax));
            this.jugador.y = Math.max(this.areaJuego.yMin, Math.min(this.jugador.y, this.areaJuego.yMax));

            for (let civil of this.civiles) civil.actualizar();
            for (let civil of this.civilesQuietos) civil.actualizar();
        }

        if (this.pungueo) this.pungueo.actualizar();

        for (let civil of this.civilesQuietos) {
            const distancia = Vector.dist(civil.position, this.jugador.position);
            if (distancia < this.jugador.rangoVisual) civil.mostrarBurbuja();
            else civil.ocultarBurbuja();
        }

        let camX = -(this.jugador.x - this.app.screen.width / 2);
        let camY = -(this.jugador.y - this.app.screen.height / 2);

        camX = Math.min(camX, 0);
        camX = Math.max(camX, this.app.screen.width - this.width);
        camY = Math.min(camY, 0);
        camY = Math.max(camY, this.app.screen.height - this.height);

        this.containerDelJuego.x = camX;
        this.containerDelJuego.y = camY;

        // CONTADOR REGRESIVO
        this.tiempoRestante -= this.app.ticker.deltaMS / 1000;
        if (this.tiempoRestante < 0) this.tiempoRestante = 0;

        const minutos = Math.floor(this.tiempoRestante / 60);
        const segundos = Math.floor(this.tiempoRestante % 60);

        const mm = minutos.toString().padStart(2, "0");
        const ss = segundos.toString().padStart(2, "0");

        this.textoTiempo.text = `${mm}:${ss}`;

        if (mm === "00" && ss === "00" && !this.pantallaFinalMostrada) {
            this.mostrarPantallaFinal();
        }

        this.layerCiviles.sortChildren();
        this.layerCivilesQuietos.sortChildren();
        this.layerJugador.sortChildren();
        this.layerEntidades.sortChildren();
    }

}