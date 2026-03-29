const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#4facfe', // Cor base do céu
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 }, // Gravidade ajustada para mobile (mais rápida)
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let currentBlock;
let blocks;
let ground;
let score = 0;
let scoreText;
let isDropping = false;

function preload() {
    // Carregando suas imagens da pasta assets
    this.load.image('blockLog', 'assets/block_log.png');
    this.load.image('ground', 'assets/ground_platform.png');
    this.load.image('buttonBuild', 'assets/button_build.png');
    this.load.image('buttonCashout', 'assets/button_cashout.png');
}

function create() {
    const { width, height } = this.scale;

    // --- GERANDO BACKGROUND VIA CÓDIGO ---
    let graphics = this.add.graphics();
    // Cria um degradê de azul (Céu)
    graphics.fillGradientStyle(0x4facfe, 0x4facfe, 0x00f2fe, 0x00f2fe, 1);
    graphics.fillRect(0, 0, width, height);

    // Adiciona algumas "nuvens" simples via código (círculos brancos com transparência)
    for (let i = 0; i < 5; i++) {
        let x = Phaser.Math.Between(0, width);
        let y = Phaser.Math.Between(0, height / 2);
        this.add.circle(x, y, 40, 0xffffff, 0.3);
        this.add.circle(x + 30, y + 10, 30, 0xffffff, 0.3);
    }

    // --- FÍSICA E ELEMENTOS ---
    ground = this.physics.add.staticImage(width / 2, height - 150, 'ground');
    
    blocks = this.physics.add.group();
    this.physics.add.collider(blocks, ground);
    this.physics.add.collider(blocks, blocks);

    // UI - Placar
    scoreText = this.add.text(20, 20, 'MULTIPLICADOR: x1.0', { 
        fontSize: '24px', 
        fill: '#fff',
        fontFamily: 'Arial Black'
    });

    // BOTÕES (BUILD E CASHOUT)
    let btnBuild = this.add.image(width * 0.75, height - 60, 'buttonBuild').setInteractive().setScale(0.8);
    let btnCashout = this.add.image(width * 0.25, height - 60, 'buttonCashout').setInteractive().setScale(0.8);

    // EVENTOS DE TOQUE
    btnBuild.on('pointerdown', () => {
        if (!isDropping) dropBlock.call(this);
    });

    btnCashout.on('pointerdown', () => {
        alert("Você saiu com: " + scoreText.text);
        location.reload(); // Reinicia o jogo
    });

    // Iniciar o primeiro bloco oscilante
    spawnBlock.call(this);
}

function update() {
    // Se o bloco ainda não foi solto, ele oscila horizontalmente
    if (currentBlock && !isDropping) {
        currentBlock.x = (this.scale.width / 2) + Math.sin(this.time.now / 300) * (this.scale.width * 0.3);
    }
}

function spawnBlock() {
    const { width } = this.scale;
    isDropping = false;

    // Cria o bloco no topo
    currentBlock = this.physics.add.sprite(width / 2, 100, 'blockLog');
    currentBlock.setCollideWorldBounds(true);
    currentBlock.body.setAllowGravity(false); // Fica parado no ar até o clique
}

function dropBlock() {
    isDropping = true;
    currentBlock.body.setAllowGravity(true);
    blocks.add(currentBlock);

    // Verifica se o bloco caiu para fora (Game Over simplificado)
    this.time.delayedCall(2000, () => {
        if (currentBlock && currentBlock.y > this.scale.height) {
            alert("Torre caiu! Tente novamente.");
            location.reload();
        } else {
            score += 0.5;
            scoreText.setText('MULTIPLICADOR: x' + score.toFixed(1));
            spawnBlock.call(this);
        }
    }, [], this);
}