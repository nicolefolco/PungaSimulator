class Juego {
    app;
    civiles = [];
    jugador;
    mouseX = 0;
    mouseY = 0;
    width;
    height;
    velocidad = 0.007;

    constructor() {
        this.width = 15360; // mundo gigante
        this.height = 1080;
        this.initPIXI();
    }

    async initPIXI() {
        this.app = new PIXI.Application();
        await this.app.init({ background: '#6495ED', width: 1920, height: 960 });
        globalThis.__PIXI_APP__ = this.app;

        document.body.appendChild(this.app.canvas);

        // ────────────────────────────────
        // CONTENEDOR PRINCIPAL (cámara)
        // ────────────────────────────────
        this.cameraContainer = new PIXI.Container();
        this.app.stage.addChild(this.cameraContainer);

        // LAYERS
        this.layerFondo = new PIXI.Container();
        this.layerCiviles = new PIXI.Container();
        this.layerJugador = new PIXI.Container();

        this.cameraContainer.addChild(this.layerFondo);
        this.cameraContainer.addChild(this.layerCiviles);
        this.cameraContainer.addChild(this.layerJugador);

        // ─── FONDO ───
        const texturaFondo = await PIXI.Assets.load('fondoEstacionTren.jpg');
        const fondo = new PIXI.Sprite(texturaFondo);
        fondo.width = this.width;
        fondo.height = this.height;
        this.layerFondo.addChild(fondo);

        // CONTENEDOR UI (FIJO)
        this.uiContainer = new PIXI.Container();
        this.app.stage.addChild(this.uiContainer);

        // HUD – cartel del contador
        const texturaCartelHUD = await PIXI.Assets.load('int_contador.png');
        const px = 450 / 1920;
        const py = 550 / 960;

        this.cartelHUD = new PIXI.Sprite(texturaCartelHUD);
        console.log(this.cartelHUD.x)
        console.log(this.cartelHUD.y)
        this.cartelHUD.x = this.app.screen.width * px;
        this.cartelHUD.y = this.app.screen.height * py;



        this.uiContainer.addChild(this.cartelHUD);

        // ────────────────────────────────
        // CONTADOR REGRESIVO (2 min)
        // ────────────────────────────────
        const tx = 820 / 1920;
        const ty = 810 / 960;

        this.tiempoRestante = 120; // segundos

        this.textoTiempo = new PIXI.Text({
            text: "02:00",
            style: {
                fill: "white",
                fontSize: 48,
                fontFamily: "Arial"
            }
        });

        this.textoTiempo.x = this.app.screen.width * tx;
        this.textoTiempo.y = this.app.screen.height * ty;

        // Agregar a UI (NO a la cámara)
        this.uiContainer.addChild(this.textoTiempo);

        // ─── ÁREA DE JUEGO ───
        this.areaJuego = {
            xMin: 0,
            xMax: this.width,
            yMin: 350,
            yMax: this.height - 300
        };

        // ─── CIVILES ───
        const sheet = await PIXI.Assets.load('./civiltexture.json');
        const framesCivil = [];

        for (let i = 1; i <= 10; i++) {
            framesCivil.push(sheet.textures[`caminarIzquierda_Normal (${i}).png`]);
        }

        for (let i = 0; i < 300; i++) {
            const x = Math.random() * this.width;
            const y = random(this.areaJuego.yMin, this.areaJuego.yMax);
            const civil = new Civil(framesCivil, x, y, this);

            this.layerCiviles.addChild(civil);
            this.civiles.push(civil);
        }

        // . ݁₊ ⊹ . ݁ cambiar calidad con escala  ݁ . ⊹ ₊ ݁.

        for (let i = 1; i <= 10; i++) {
            const tex = sheet.textures[`caminarIzquierda_Normal (${i}).png`];
            tex.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
            framesCivil.push(tex);
            }

        // ─── JUGADOR ───
        const pagina = await PIXI.Assets.load('./jugador.json');
        const frames = [];

        for (let i = 1; i <= 10; i++) {
            frames.push(pagina.textures[`caminando_izq (${i}).png`]);
        }

        this.jugador = new PIXI.AnimatedSprite(frames);
        this.jugador.anchor.set(0.5);
        this.jugador.scale.set(3);

        // posición del jugador en el mundo
        this.jugador.x = this.width / 2;
        this.jugador.y = this.height / 2;

        this.jugador.animationSpeed = 0.15;
        this.jugador.play();
        this.layerJugador.addChild(this.jugador);

        // . ݁₊ ⊹ . ݁ cambiar calidad con escala  ݁ . ⊹ ₊ ݁.

        for (let i = 1; i <= 10; i++) {
            const tex = pagina.textures[`caminando_izq (${i}).png`];
            tex.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
            frames.push(tex);
            }

        // Mouse real
        window.addEventListener("mousemove", (e) => {
            const rect = this.app.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });

        // LOOP PRINCIPAL
        this.app.ticker.add(() => {

            // Mouse pantalla → mundo
            const worldMouseX = this.mouseX - this.cameraContainer.x;
            const worldMouseY = this.mouseY - this.cameraContainer.y;

            const dx = worldMouseX - this.jugador.x;
            const dy = worldMouseY - this.jugador.y;

            this.jugador.x += dx * this.velocidad;
            this.jugador.y += dy * this.velocidad;

            // reflejo horizontal
            if (dx > 0) this.jugador.scale.x = -3;
            else if (dx < 0) this.jugador.scale.x = 3;

            // limitar al área
            this.jugador.x = Math.max(this.areaJuego.xMin, Math.min(this.jugador.x, this.areaJuego.xMax));
            this.jugador.y = Math.max(this.areaJuego.yMin, Math.min(this.jugador.y, this.areaJuego.yMax));

            // actualizar civiles
            for (let civil of this.civiles) {
                civil.actualizar();
            }

            // ─────────────────────────────
            // CÁMARA SIGUIENDO AL JUGADOR
            // ─────────────────────────────

            let camX = -(this.jugador.x - this.app.screen.width / 2);
            let camY = -(this.jugador.y - this.app.screen.height / 2);

            // límites del mundo
            camX = Math.min(camX, 0);
            camX = Math.max(camX, this.app.screen.width - this.width);

            camY = Math.min(camY, 0);
            camY = Math.max(camY, this.app.screen.height - this.height);

            this.cameraContainer.x = camX;
            this.cameraContainer.y = camY;

            // ─────────────────────────────
            // CONTADOR REGRESIVO (CORREGIDO)
            // ─────────────────────────────

            this.tiempoRestante -= this.app.ticker.deltaMS / 1000;

            if (this.tiempoRestante < 0) this.tiempoRestante = 0;

            const minutos = Math.floor(this.tiempoRestante / 60);
            const segundos = Math.floor(this.tiempoRestante % 60);

            const mm = minutos.toString().padStart(2, "0");
            const ss = segundos.toString().padStart(2, "0");

            this.textoTiempo.text = `${mm}:${ss}`;
        });
    }
}
