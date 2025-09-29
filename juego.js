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

    // Civiles de prueba
    const texture = await PIXI.Assets.load('https://pixijs.com/assets/bunny.png');
    for (let i = 0; i < 10; i++) {
        const civil = new PIXI.Sprite(texture);
        civil.x = Math.random() * this.width;
        civil.y = Math.random() * this.height;
        this.civiles.push(civil);
        this.app.stage.addChild(civil);
    }

    // ===============================
    // JUGADOR DESDE SPRITESHEET JSON
    // ===============================
    await PIXI.Assets.load("./pungatexture.json");

    // Creamos el array de frames
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

    // AnimatedSprite
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
        // Mover jugador hacia el mouse
        const dx = this.mouseX - this.jugador.x;
        const dy = this.mouseY - this.jugador.y;

        this.jugador.x += dx * this.velocidad;
        this.jugador.y += dy * this.velocidad;

        // Reflejar según dirección X
        if (dx > 0) {
            this.jugador.scale.x = -2;  // mirando a la derecha
        } else if (dx < 0) {
            this.jugador.scale.x = 2; // mirando a la izquierda
        }

        // Civiles reaccionan
        for (const civil of this.civiles) {
            const dx = this.jugador.x - civil.x;
            const dy = this.jugador.y - civil.y;
            const distancia = Math.sqrt(dx * dx + dy * dy);
            const radioVision = 150;

            if (distancia < radioVision) {
                civil.x += dx * 0.02;
                civil.y += dy * 0.02;
            }
        }
    });
}
}
// }
