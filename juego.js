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
        this.width = 1280;
        this.height = 720;
        this.initPIXI();
    }

    async initPIXI() {
        this.app = new PIXI.Application();
        await this.app.init({ background: '#6495ED', width: this.width, height: this.height });
        globalThis.__PIXI_APP__ = this.app;

        document.body.appendChild(this.app.canvas);

        // ===============================
        // CIVILES DESDE SPRITESHEET JSON
        // ===============================
        await PIXI.Assets.load('./civiltexture.json');

        const framesCivil = [
            PIXI.Texture.from("caminarIzquierda_Normal (1).png"),
            PIXI.Texture.from("caminarIzquierda_Normal (2).png"),
            PIXI.Texture.from("caminarIzquierda_Normal (3).png"),
            PIXI.Texture.from("caminarIzquierda_Normal (4).png"),
            PIXI.Texture.from("caminarIzquierda_Normal (5).png"),
            PIXI.Texture.from("caminarIzquierda_Normal (6).png"),
            PIXI.Texture.from("caminarIzquierda_Normal (7).png"),
            PIXI.Texture.from("caminarIzquierda_Normal (8).png"),
            PIXI.Texture.from("caminarIzquierda_Normal (9).png"),
            PIXI.Texture.from("caminarIzquierda_Normal (10).png"),
        ];

        for (let i = 0; i < 10; i++) {
            const civil = new PIXI.AnimatedSprite(framesCivil);

            civil.anchor.set(0.5);
            civil.animationSpeed = 0.15;
            civil.play();

            civil.x = Math.random() * this.width;
            civil.y = Math.random() * this.height;
            civil.scale.set(1.5);

            this.app.stage.addChild(civil);
            this.civiles.push(civil);
        }

        // ===============================
        // JUGADOR DESDE SPRITESHEET JSON
        // ===============================
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
        this.jugador.x = this.app.view.width / 2;
        this.jugador.y = this.app.view.height / 2;
        this.jugador.animationSpeed = 0.15;
        this.jugador.play();

        this.app.stage.addChild(this.jugador);

        // Mouse tracking
        window.addEventListener("mousemove", (e) => {
            const rect = this.app.view.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });

        // Loop principal
        this.app.ticker.add(() => {
            // ========================
            // Mover jugador al mouse
            // ========================
            const dx = this.mouseX - this.jugador.x;
            const dy = this.mouseY - this.jugador.y;

            this.jugador.x += dx * this.velocidad;
            this.jugador.y += dy * this.velocidad;

            // Reflejar jugador
            if (dx > 0) {
                this.jugador.scale.x = -2;  // mirando a la derecha
            } else if (dx < 0) {
                this.jugador.scale.x = 2;   // mirando a la izquierda
            }

            // ========================
            // Civiles reaccionan
            // ========================
            for (const civil of this.civiles) {
                const dx = this.jugador.x - civil.x;
                const dy = this.jugador.y - civil.y;
                const distancia = Math.sqrt(dx * dx + dy * dy);
                const radioVision = 150;

                if (distancia < radioVision) {
                    // Movimiento hacia el jugador
                    civil.x += dx * 0.02;
                    civil.y += dy * 0.02;

                    // Reflejar civil según dirección
                    if (dx > 0) {
                        civil.scale.x = -1.5; // mirando a la derecha
                    } else if (dx < 0) {
                        civil.scale.x = 1.5;  // mirando a la izquierda
                    }
                }
            }
        });
    }
}
