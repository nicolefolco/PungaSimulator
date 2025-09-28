class Juego {
app;
civiles = [];
jugador;
mouseX = 0;
mouseY = 0;
width;
height;
 velocidad = 0.05; // porcentaje de distancia 

constructor() {
    this.width = 1280;
    this.height = 720;
    this.initPIXI();
}

    async initPIXI() {
                this.app = new PIXI.Application();
                await this.app.init({background: '#6495ED', width: this.width, height: this.height});
                globalThis.__PIXI_APP__ = this.app;


            // Append the application canvas to the document body
            document.body.appendChild(this.app.canvas);

            const texture = await PIXI.Assets.load('https://pixijs.com/assets/bunny.png');

            for (let i = 0; i < 10; i++ ){ // se repite el código hasta que i valga 10. (i++ es equivalente a i += 1, contando así las iteraciones)
                const civil = new PIXI.Sprite(texture) // crea el sprite del conejito.
                civil.x = Math.random() * this.width // le asigna una posición en x multiplicada por un número al azar entre 0 y el ancho de la pantalla.
                civil.y = Math.random() * this.height  // le asigna una posición en x multiplicada por un número al azar entre 0 y el largo de la pantalla.
                this.civiles.push(civil) // le suma a la variable civiles 1 en cada iteración (repetición).

                this.app.stage.addChild(civil); // agrega civiles al escenario
            }

// objeto del jugador (cambiar a json)
            const textJugador = await PIXI.Assets.load("https://cdn-icons-png.flaticon.com/512/1622/1622535.png");
            this.jugador = new PIXI.Sprite(textJugador)
            this.jugador.anchor.set(0.5);
            this.jugador.x = this.app.view.width / 2; // app.view es el canvas de pixi.js 
            this.jugador.y = this.app.view.height / 2; // estas dos lineas (35 y 36) coloca al Sprite en el medio del canvas.
            this.jugador.scale.set(0.1); // cambia el tamaño del Sprite

            this.app.stage.addChild(this.jugador);

// guardar posición del mouse
            window.addEventListener("mousemove", (e) => {
                const rect = this.app.view.getBoundingClientRect();
                this.mouseX = e.clientX - rect.left;
                this.mouseY = e.clientY - rect.top;
            });


            this.app.ticker.add(() => {
                // Mover jugador hacia el mouse
                this.jugador.x += (this.mouseX - this.jugador.x) * this.velocidad;
                this.jugador.y += (this.mouseY - this.jugador.y) * this.velocidad;

                // Mover civiles si están cerca del jugador
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