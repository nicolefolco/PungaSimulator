class Juego {
    
    app;
    civiles = [];
    jugador;
    mouseX = 0;
    mouseY = 0;
    width;
    height;
    velocidad = 0.01;

    constructor() {
        this.width = 1920;
        this.height = 1080;
        this.initPIXI();
    }

    async initPIXI() {
        this.app = new PIXI.Application();
        await this.app.init({ background: '#6495ED', width: this.width, height: this.height });
        globalThis.__PIXI_APP__ = this.app;

        document.body.appendChild(this.app.canvas);

        // ───          ⋆⋅☆⋅⋆          ──
        // ⏔⏔⏔ ꒰ ᧔ CONTAINTERS ᧓ ꒱ ⏔⏔⏔
        // ───          ⋆⋅☆⋅⋆          ──

        this.layerFondo = new PIXI.Container();
        this.layerCiviles = new PIXI.Container();
        this.layerJugador = new PIXI.Container();

        this.app.stage.addChild(this.layerFondo);
        this.app.stage.addChild(this.layerCiviles);
        this.app.stage.addChild(this.layerJugador);

        // ───          ⋆⋅☆⋅⋆          ──
        // ⏔⏔⏔ ꒰ ᧔    FONDO   ᧓ ꒱ ⏔⏔⏔
        // ───          ⋆⋅☆⋅⋆          ──

        const texturaFondo = await PIXI.Assets.load('estacion_de_noche.png');
        const fondo = new PIXI.Sprite(texturaFondo);
        fondo.width = this.width;
        fondo.height = this.height;

        this.layerFondo.addChild(fondo);

        // ───          ⋆⋅☆⋅⋆          ──
        // ⏔⏔⏔ ꒰ ᧔AREA CAMINABLE᧓ ꒱ ⏔⏔⏔
        // ───          ⋆⋅☆⋅⋆          ──

        this.areaJuego = {
            xMin: 0,
            xMax: this.width,
            yMin: 400, // cambiar a porcentaje
            yMax: this.height - 270 // cambiar a porcentaje
        };

        // ───          ⋆⋅☆⋅⋆          ──
        // ⏔⏔⏔ ꒰ ᧔   CIVILES   ᧓ ꒱ ⏔⏔⏔
        // ───          ⋆⋅☆⋅⋆          ──

        const sheet = await PIXI.Assets.load('./civiltexture.json');

        const framesCivil = [];
        for (let i = 1; i <= 10; i++) {
            framesCivil.push(sheet.textures[`caminarIzquierda_Normal (${i}).png`])
        }

        for (let i = 0; i < 300; i++) {
            const x = Math.random() * this.width;
            const y = random(this.areaJuego.yMin, this.areaJuego.yMax);
            const civil = new Civil(framesCivil, x, y, this);
            // civil.x = Math.max(this.areaJuego.xMin, Math.min(civil.x, this.areaJuego.xMax));
            // civil.y = Math.max(this.areaJuego.yMin, Math.min(civil.y, this.areaJuego.yMax));

            this.layerCiviles.addChild(civil);
            this.civiles.push(civil);
        }

        // ───          ⋆⋅☆⋅⋆          ──
        // ⏔⏔⏔ ꒰ ᧔   JUGADOR   ᧓ ꒱ ⏔⏔⏔
        // ───          ⋆⋅☆⋅⋆          ──

        await PIXI.Assets.load("./pungatexture.json");

        const frames = [
            PIXI.Texture.from("117.png"),
            PIXI.Texture.from("118.png"),
            PIXI.Texture.from("119.png"),
            PIXI.Texture.from("120.png"),
            PIXI.Texture.from("121.png"),
            PIXI.Texture.from("122.png"),
            PIXI.Texture.from("123.png"),
            PIXI.Texture.from("124.png"),
        ];

        this.jugador = new PIXI.AnimatedSprite(frames);
        this.jugador.anchor.set(0.5);
        this.jugador.scale.set(2);
        this.jugador.x = this.app.canvas.width / 2;
        this.jugador.y = this.app.canvas.height / 2;
        this.jugador.animationSpeed = 0.15;
        this.jugador.play();

        this.layerJugador.addChild(this.jugador);

        // Mouse tracking
        window.addEventListener("mousemove", (e) => {
            const rect = this.app.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });

        // Loop principal

        this.app.ticker.add((dt) => {
            const dx = this.mouseX - this.jugador.x;
            const dy = this.mouseY - this.jugador.y;

            this.jugador.x += dx * this.velocidad;
            this.jugador.y += dy * this.velocidad;

            // Reflejar jugador
            if (dx > 0) {
                this.jugador.scale.x = -2;
            } else if (dx < 0) {
                this.jugador.scale.x = 2;
            }

            // ========================
            //  Limitar al área permitida
            // ========================
            this.jugador.x = Math.max(this.areaJuego.xMin, Math.min(this.jugador.x, this.areaJuego.xMax));
            this.jugador.y = Math.max(this.areaJuego.yMin, Math.min(this.jugador.y, this.areaJuego.yMax));

            // ========================
            // Civiles reaccionan
            // ========================

            for (let civil of this.civiles) {
            civil.actualizar()
        }


    })
}
}
