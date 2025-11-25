class Juego {

    app;
    width;
    height;
    estadoActual;
    jugador;
    velocidad = 0.007
    mouseX = 0;      
    mouseY = 0;
    civiles = [];
    civilesQuietos = [];
    pungueo= null;

    // construcción del juego con la resolución COMPLETA del mapa
    constructor() {
        this.width = 15360;
        this.height = 1080;
        this.iniciarPIXI();
    }

    // inicializamos pixi con la resolución visisble en pantalla
    async iniciarPIXI() {
        this.app = new PIXI.Application();
        globalThis.__PIXI_APP__ = this.app;

        await this.app.init({
            background: "#ff32ff",
            width: 1920,
            height: 960
        });

        document.body.appendChild(this.app.canvas);

        // CONTAINER PRINCIPAL del juego, todo sucederá en este containter raíz
        this.containerDelJuego = new PIXI.Container();
        this.app.stage.addChild(this.containerDelJuego);

        // CONTAINER CÁMARA (ver si poner dentro del container de juego o qué hace)
        this.cameraContainer = new PIXI.Container();
        this.app.stage.addChild(this.cameraContainer);

        // inicializamos el menú ya que es la primera pantalla presente en el juego
        this.cargarMenu();
    }

    // función para cargar la instancia del menú
    cargarMenu() {
        this.menu = new Menu(this);
    }

    // función para cargar el juego
    async cargarJuego() {

        this.areaJuego = {
            xMin: 0,
            xMax: this.width,
            yMin: 350,
            yMax: this.height - 300
        };

        await this.cargarFondoJuego();
        this.cargarHUD();
        await this.cargarCiviles();
        await this.cargarJugador();
        await this.cargarElementosEstaticos();

        window.addEventListener("mousemove", (e) => {
            const rect = this.app.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });

        window.addEventListener("keydown", (e) => {
            if (e.repeat) return;

            if (e.key === "f" || e.key === "F") {
                const civilQuietoCercano = this.getCivilQuietoCercano(this.jugador.rangoVisual);
    
            if (civilQuietoCercano) {
                if (!this.pungueo) {
                    this.pungueo = new Pungueo( (resultado) => {
                    console.log("Resultado:", resultado);
                    }, this);
                }

            this.pungueo.iniciar();
            }
        }
    });

        // GAME LOOP!!!!
        this.app.ticker.add(() => this.gameLoop());

    } 

    async cargarFondoJuego() {
        const fondoJuegoTextura = await PIXI.Assets.load("assets/fondoEstacionTren.jpg");
        const fondoJuego = new PIXI.Sprite(fondoJuegoTextura);
        fondoJuego.width = this.width;
        fondoJuego.height = this.height;
        this.containerDelJuego.addChildAt(fondoJuego, 0);
    }

    async cargarElementosEstaticos() {
        const choripaneriaTextura = await PIXI.Assets.load("assets/choripaneria.png");
        const choripaneria = new PIXI.Sprite(choripaneriaTextura);
        
        choripaneria.anchor.set(0.5);
        choripaneria.scale.set(1.5);

        choripaneria.x = 4782;
        choripaneria.y = 540;

        // 🎯 PISO VISUAL (línea imaginaria donde empiezan las partes delanteras)
        const pisoVisual = choripaneria.y + 40;
        choripaneria.zIndex = pisoVisual;

        this.layerEntidades.addChild(choripaneria);

        const hitbox = new PIXI.Graphics();
        hitbox.beginFill(0x000000,0); // negro
        hitbox.drawRect(0, 0, 1010, 30); // x, y, ancho, alto
        hitbox.endFill();

        // posición en el mundo
        hitbox.x = 4288;
        hitbox.y = 530;

        // agregar al contenedor del juego
        this.containerDelJuego.addChild(hitbox);

        this.hitboxChori = hitbox;
    }

    cargarHUD() {
        this.hudContainer = new PIXI.Container();
        this.cameraContainer.addChild(this.hudContainer);

        this.cargarCartelContador();
        this.cargarContador();
    }

    async cargarCartelContador() {
        const texturaCartelContador = await PIXI.Assets.load("assets/int_contador.png");
        const px = 490 / 1920;
        const py = 580 / 960;

        this.cartelContador = new PIXI.Sprite(texturaCartelContador);
        console.log(this.cartelContador.x)
        console.log(this.cartelContador.y)
        this.cartelContador.x = this.app.screen.width * px;
        this.cartelContador.y = this.app.screen.height * py;
        this.cartelContador.scale.set(0.9)

        this.hudContainer.addChildAt(this.cartelContador,0);
    }

    cargarContador() {

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

        // agregar a HUD
        this.hudContainer.addChild(this.textoTiempo); 
    }

    async cargarCiviles() {

        this.layerCiviles = new PIXI.Container();
        this.layerCiviles.sortableChildren = true;
        this.containerDelJuego.addChild(this.layerCiviles)

        this.layerEntidades = new PIXI.Container();
        this.layerEntidades.sortableChildren = true;
        this.containerDelJuego.addChild(this.layerEntidades)

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

        // . ݁₊ ⊹ . ݁ cambiar calidad con escala  ݁ . ⊹ ₊ ݁.

        for (let i = 1; i <= 10; i++) {
            const tex = sheet.textures[`caminarIzquierda_Normal (${i}).png`];
            tex.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
            framesCivil.push(tex);
        }

        // ───             ⋆⋅☆⋅⋆          ──
        // ⏔⏔⏔ ꒰ ᧔   CIVILES QUIETOS  ᧓ ꒱ ⏔⏔⏔
        // ───             ⋆⋅☆⋅⋆          ──

        this.layerCivilesQuietos = new PIXI.Container();
        this.layerCivilesQuietos.sortableChildren = true;
        this.containerDelJuego.addChild(this.layerCivilesQuietos)
        
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
            //console.log("burbuja", burbuja.x, burbuja.y, burbuja.visible);
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
        this.jugador.rangoVisual = 100

        // posición del jugador en el mundo
        this.jugador.x = this.width / 2;
        this.jugador.y = this.height / 2;

        this.jugador.animationSpeed = 0.15;
        this.jugador.play();
        this.layerJugador.addChild(this.jugador);
        this.layerEntidades.addChild(this.jugador);

        // . ݁₊ ⊹ . ݁ cambiar calidad con escala  ݁ . ⊹ ₊ ݁.

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

    gameLoop() {
        
    const dt = this.app.ticker.deltaMS / 16.67;

    // ╰┈➤ MINIJUEGO DE PUNGUEO
    const pungueoActivo = this.pungueo && this.pungueo.activo;

    if (!pungueoActivo) {

        // Mouse pantalla → mundo
        const worldMouseX = this.mouseX - this.containerDelJuego.x;
        const worldMouseY = this.mouseY - this.containerDelJuego.y;

        const dx = worldMouseX - this.jugador.x;
        const dy = worldMouseY - this.jugador.y;

        // Movimiento con delta
        this.jugador.x += dx * this.velocidad * dt;
        this.jugador.y += dy * this.velocidad * dt;
        this.jugador.zIndex = this.jugador.y;

        // Reflejo horizontal
        if (dx > 0) this.jugador.scale.x = -3;
        else if (dx < 0) this.jugador.scale.x = 3;

        // Limitar área
        this.jugador.x = Math.max(this.areaJuego.xMin, Math.min(this.jugador.x, this.areaJuego.xMax));
        this.jugador.y = Math.max(this.areaJuego.yMin, Math.min(this.jugador.y, this.areaJuego.yMax));

        // Actualizar civiles
        for (let civil of this.civiles) civil.actualizar();
        for (let civil of this.civilesQuietos) civil.actualizar();

    }

    // Actualizar minijuego de pungueo
    if (this.pungueo) this.pungueo.actualizar();

    // Mostrar/ocultar burbujas
    for (let civil of this.civilesQuietos) {
        const distancia = Vector.dist(civil.position, this.jugador.position);
        if (distancia < this.jugador.rangoVisual) civil.mostrarBurbuja();
        else civil.ocultarBurbuja();
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

        this.containerDelJuego.x = camX;
        this.containerDelJuego.y = camY;

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

        this.layerCiviles.sortChildren();
        this.layerCivilesQuietos.sortChildren();
        this.layerJugador.sortChildren();
        this.layerEntidades.sortChildren();  

    // ─────────────────────────────
    // COLISIÓN HITBOX CHORIPANERÍA (AABB correcto)
    // ─────────────────────────────
    if (this.hitboxChori) {

        const hb = this.hitboxChori;

        const hbLeft = hb.x;
        const hbRight = hb.x + hb.width;
        const hbTop = hb.y;
        const hbBottom = hb.y + hb.height;

        // Radio aproximado del jugador (ajustalo si querés)
        const r = 30;

        let px = this.jugador.x;
        let py = this.jugador.y;

        // ¿El jugador está intentando entrar al rectángulo?
        const overlapX = px + r > hbLeft && px - r < hbRight;
        const overlapY = py + r > hbTop  && py - r < hbBottom;

        if (overlapX && overlapY) {

            // Distancias a cada borde
            const distTop = Math.abs((py + r) - hbTop);
            const distBottom = Math.abs((py - r) - hbBottom);
            const distLeft = Math.abs((px + r) - hbLeft);
            const distRight = Math.abs((px - r) - hbRight);

            const minDist = Math.min(distTop, distBottom, distLeft, distRight);

            // Resolver por el lado más cercano
            if (minDist === distTop) {
                // Bloquea desde arriba (jugador encima)
                this.jugador.y = hbTop - r;
            }
            else if (minDist === distBottom) {
                // Bloquea desde abajo
                this.jugador.y = hbBottom + r;
            }
            else if (minDist === distLeft) {
                // Bloquea desde izquierda
                this.jugador.x = hbLeft - r;
            }
            else if (minDist === distRight) {
                // Bloquea desde derecha
                this.jugador.x = hbRight + r;
            }
        }
    }


    }

}