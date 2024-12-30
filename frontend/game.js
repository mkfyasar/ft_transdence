class PongGame {
    constructor(canvas, isAI = false, difficulty = 'normal') {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.isAI = isAI;
        this.difficulty = difficulty;

        // Ses efektleri
        this.sounds = {
            hit: { play: () => {}, load: () => {}, pause: () => {}, currentTime: 0 },
            score: { play: () => {}, load: () => {}, pause: () => {}, currentTime: 0 },
            powerup: { play: () => {}, load: () => {}, pause: () => {}, currentTime: 0 }
        };

        // Oyun ayarları
        this.paddleHeight = 100;
        this.paddleWidth = 10;
        this.ballSize = 10;
        
        // Zorluk seviyesine göre AI hızı
        this.aiDifficulties = {
            easy: 0.05,
            normal: 0.08,
            hard: 0.12
        };
        this.aiDifficulty = this.aiDifficulties[difficulty];

        // Güç-uplar
        this.powerUps = [];
        this.activePowerUps = {
            player: [],
            opponent: []
        };
        this.powerUpTypes = [
            {
                type: 'bigger-paddle',
                duration: 5000,
                color: '#00ff00',
                apply: (player) => {
                    player.originalHeight = player.height;
                    player.height = 150;
                },
                remove: (player) => {
                    player.height = player.originalHeight;
                }
            },
            {
                type: 'faster-ball',
                duration: 3000,
                color: '#ff0000',
                apply: () => {
                    this.ball.originalSpeed = this.ball.speed;
                    this.ball.speed *= 1.5;
                },
                remove: () => {
                    this.ball.speed = this.ball.originalSpeed;
                }
            },
            {
                type: 'slow-opponent',
                duration: 4000,
                color: '#0000ff',
                apply: () => {
                    this.aiDifficulty *= 0.5;
                },
                remove: () => {
                    this.aiDifficulty = this.aiDifficulties[this.difficulty];
                }
            }
        ];

        // Oyun nesneleri
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            speed: 5,
            dx: 5,
            dy: 5,
            originalSpeed: 5
        };

        this.player = {
            y: (this.canvas.height - this.paddleHeight) / 2,
            height: this.paddleHeight,
            score: 0
        };

        this.opponent = {
            y: (this.canvas.height - this.paddleHeight) / 2,
            height: this.paddleHeight,
            score: 0
        };

        // Event listeners
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));

        // Animasyon frame'i
        this.frameId = null;
        this.lastPowerUpTime = 0;
    }

    handleMouseMove(e) {
        let rect = this.canvas.getBoundingClientRect();
        let mouseY = e.clientY - rect.top;
        this.player.y = mouseY - this.player.height / 2;

        // Sınırları kontrol et
        if (this.player.y < 0) this.player.y = 0;
        if (this.player.y > this.canvas.height - this.player.height) {
            this.player.y = this.canvas.height - this.player.height;
        }
    }

    // Güç-up oluştur
    spawnPowerUp() {
        const now = Date.now();
        if (now - this.lastPowerUpTime > 5000) { // Her 5 saniyede bir
            const powerUpType = this.powerUpTypes[Math.floor(Math.random() * this.powerUpTypes.length)];
            this.powerUps.push({
                x: Math.random() * (this.canvas.width - 40) + 20,
                y: Math.random() * (this.canvas.height - 40) + 20,
                size: 20,
                type: powerUpType
            });
            this.lastPowerUpTime = now;
        }
    }

    // Güç-up toplama kontrolü
    checkPowerUpCollision() {
        this.powerUps = this.powerUps.filter(powerUp => {
            // Top ile güç-up çarpışması
            const dx = this.ball.x - powerUp.x;
            const dy = this.ball.y - powerUp.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.ballSize + powerUp.size / 2) {
                this.sounds.powerup.play();
                const collector = this.ball.dx > 0 ? 'opponent' : 'player';
                this.activatePowerUp(powerUp.type, collector);
                return false;
            }
            return true;
        });
    }

    // Güç-up aktifleştirme
    activatePowerUp(powerUp, target) {
        powerUp.apply(this[target]);
        this.activePowerUps[target].push({
            type: powerUp,
            endTime: Date.now() + powerUp.duration
        });
    }

    // Aktif güç-upları güncelle
    updatePowerUps() {
        const now = Date.now();
        ['player', 'opponent'].forEach(target => {
            this.activePowerUps[target] = this.activePowerUps[target].filter(powerUp => {
                if (now >= powerUp.endTime) {
                    powerUp.type.remove(this[target]);
                    return false;
                }
                return true;
            });
        });
    }

    // Çarpışma sesi
    playHitSound() {
        this.sounds.hit.currentTime = 0;
        this.sounds.hit.play();
    }

    // Skor sesi
    playScoreSound() {
        this.sounds.score.currentTime = 0;
        this.sounds.score.play();
    }

    // Yapay zeka hareketi
    updateAI() {
        if (this.isAI) {
            // Top rakibe doğru gidiyorsa
            if (this.ball.dx > 0) {
                // Hedef pozisyonu hesapla
                let targetY = this.ball.y - this.paddleHeight / 2;
                
                // Zorluğa göre hareket et
                this.opponent.y += (targetY - this.opponent.y) * this.aiDifficulty;

                // Sınırları kontrol et
                if (this.opponent.y < 0) this.opponent.y = 0;
                if (this.opponent.y > this.canvas.height - this.paddleHeight) {
                    this.opponent.y = this.canvas.height - this.paddleHeight;
                }
            }
        }
    }

    // Çarpışma kontrolü
    checkCollision() {
        // Üst ve alt duvarlarla çarpışma
        if (this.ball.y <= 0 || this.ball.y >= this.canvas.height) {
            this.ball.dy *= -1;
            this.playHitSound();
        }

        // Raketlerle çarpışma
        let playerRect = {
            x: 0,
            y: this.player.y,
            width: this.paddleWidth,
            height: this.player.height
        };

        let opponentRect = {
            x: this.canvas.width - this.paddleWidth,
            y: this.opponent.y,
            width: this.paddleWidth,
            height: this.opponent.height
        };

        if (this.ball.x <= playerRect.x + playerRect.width &&
            this.ball.y >= playerRect.y &&
            this.ball.y <= playerRect.y + playerRect.height) {
            this.ball.dx *= -1;
            this.ball.x = playerRect.x + playerRect.width;
            this.playHitSound();
        }

        if (this.ball.x >= opponentRect.x - this.ballSize &&
            this.ball.y >= opponentRect.y &&
            this.ball.y <= opponentRect.y + opponentRect.height) {
            this.ball.dx *= -1;
            this.ball.x = opponentRect.x - this.ballSize;
            this.playHitSound();
        }

        // Skor kontrolü
        if (this.ball.x <= 0) {
            this.opponent.score++;
            this.playScoreSound();
            this.resetBall();
        }
        if (this.ball.x >= this.canvas.width) {
            this.player.score++;
            this.playScoreSound();
            this.resetBall();
        }
    }

    // Topu başlangıç pozisyonuna al
    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.dx *= -1;
    }

    // Oyun güncelleme
    update() {
        this.ball.x += this.ball.dx * (this.ball.speed / 5);
        this.ball.y += this.ball.dy * (this.ball.speed / 5);

        this.updateAI();
        this.checkCollision();
        this.spawnPowerUp();
        this.checkPowerUpCollision();
        this.updatePowerUps();
        this.draw();

        this.frameId = requestAnimationFrame(() => this.update());
    }

    // Oyun çizimi
    draw() {
        // Arkaplanı temizle
        this.context.fillStyle = '#000000';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Orta çizgi
        this.context.strokeStyle = '#FFFFFF';
        this.context.setLineDash([5, 5]);
        this.context.beginPath();
        this.context.moveTo(this.canvas.width / 2, 0);
        this.context.lineTo(this.canvas.width / 2, this.canvas.height);
        this.context.stroke();
        this.context.setLineDash([]);

        // Raketler
        this.context.fillStyle = '#FFFFFF';
        this.context.fillRect(0, this.player.y, this.paddleWidth, this.player.height);
        this.context.fillRect(
            this.canvas.width - this.paddleWidth,
            this.opponent.y,
            this.paddleWidth,
            this.opponent.height
        );

        // Top
        this.context.beginPath();
        this.context.arc(this.ball.x, this.ball.y, this.ballSize, 0, Math.PI * 2);
        this.context.fill();

        // Skor
        this.context.font = '32px Arial';
        this.context.fillText(this.player.score, this.canvas.width / 4, 50);
        this.context.fillText(this.opponent.score, 3 * this.canvas.width / 4, 50);

        // Güç-upları çiz
        this.powerUps.forEach(powerUp => {
            this.context.fillStyle = powerUp.type.color;
            this.context.beginPath();
            this.context.arc(powerUp.x, powerUp.y, powerUp.size / 2, 0, Math.PI * 2);
            this.context.fill();
        });

        // Aktif güç-upları göster
        this.context.font = '16px Arial';
        this.context.fillStyle = '#FFFFFF';
        let y = 70;
        ['player', 'opponent'].forEach((target, index) => {
            this.activePowerUps[target].forEach(powerUp => {
                const timeLeft = Math.ceil((powerUp.endTime - Date.now()) / 1000);
                this.context.fillText(
                    `${target}: ${powerUp.type.type} (${timeLeft}s)`,
                    index === 0 ? 10 : this.canvas.width - 150,
                    y
                );
                y += 20;
            });
        });
    }

    // Oyunu başlat
    start() {
        // Oyun döngüsünü başlat
        this.frameId = requestAnimationFrame(() => this.update());
        
        // Ses dosyalarını yükle
        Object.values(this.sounds).forEach(sound => {
            sound.load();
        });
    }

    // Oyunu durdur
    stop() {
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
        // Sesleri durdur
        Object.values(this.sounds).forEach(sound => {
            sound.pause();
            sound.currentTime = 0;
        });
    }
} 