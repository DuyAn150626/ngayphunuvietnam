// --- 1. HIỆU ỨNG SƯƠNG MỜ LAU KÍNH ---
const canvas = document.getElementById('fogCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

function resizeFogCanvas() {
    if (!canvas || !ctx) return;
    canvas.style.display = 'block';
    canvas.style.opacity = '1';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(240, 242, 245, 0.96)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

window.addEventListener('resize', resizeFogCanvas);

let isDrawing = false;
let lastX = 0;
let lastY = 0;
let fadeTimeout = null;
let isFading = false;

// Hàm xóa sương liền mạch (nội suy giữa 2 điểm để không bị đứt khúc)
function clearFogSmooth(x1, y1, x2, y2) {
    if (isFading || !canvas || !ctx) return;
    ctx.globalCompositeOperation = 'destination-out';
    
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const step = 15; // Khoảng cách giữa các nét cọ (càng nhỏ càng mịn)

    for (let d = 0; d < dist; d += step) {
        const curX = x1 + Math.cos(angle) * d;
        const curY = y1 + Math.sin(angle) * d;
        ctx.beginPath();
        ctx.arc(curX, curY, 65, 0, Math.PI * 2);
        ctx.fill();
    }

    // Vẽ điểm cuối của đoạn thẳng
    ctx.beginPath();
    ctx.arc(x2, y2, 65, 0, Math.PI * 2);
    ctx.fill();
}

function clearFogSingle(x, y) {
    if (isFading || !canvas || !ctx) return;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 65, 0, Math.PI * 2);
    ctx.fill();

    if (Math.random() < 0.5) {
        createInteractiveRisingHeart(x);
    }
}

function startAutoFade() {
    if (isFading || !canvas) return;
    isFading = true;
    
    let opacity = 1.0;
    const fadeInterval = setInterval(() => {
        opacity -= 0.025;
        canvas.style.opacity = opacity;
        
        if (opacity <= 0) {
            clearInterval(fadeInterval);
            canvas.style.display = 'none';
            startCombinedHeartsRain();
        }
    }, 35);
}

function handleStart(x, y) {
    if (isFading) return;
    isDrawing = true;
    lastX = x;
    lastY = y;
    clearFogSingle(x, y);

    if (fadeTimeout) clearTimeout(fadeTimeout);
    fadeTimeout = setTimeout(() => {
        startAutoFade();
    }, 2500);
}

function handleMove(x, y) {
    if (!isDrawing || isFading) return;
    // Dùng hàm nội suy để lấp đầy khoảng trống khi rê chuột nhanh
    clearFogSmooth(lastX, lastY, x, y);
    
    lastX = x;
    lastY = y;

    if (Math.random() < 0.3) {
        createInteractiveRisingHeart(x);
    }
}

function handleEnd() {
    isDrawing = false;
}

if (canvas) {
    canvas.addEventListener('mousedown', (e) => handleStart(e.clientX, e.clientY));
    canvas.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', handleEnd);

    canvas.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        handleStart(touch.clientX, touch.clientY);
    });
    canvas.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
    });
    window.addEventListener('touchend', handleEnd);
}

function createInitialRisingHearts() {
    const container = document.getElementById('rainHearts');
    if (!container) return;

    const heartCount = 20;
    for (let i = 0; i < heartCount; i++) {
        const heart = document.createElement('div');
        heart.classList.add('rising-heart');
        
        const size = Math.random() * 10 + 6;
        heart.style.width = `${size}px`;
        heart.style.height = `${size}px`;
        heart.style.left = `${Math.random() * 100}vw`;
        
        // Tăng thời gian bay lên từ từ (từ 7 đến 12 giây)
        const duration = Math.random() * 5 + 7; 
        const delay = Math.random() * 6;
        heart.style.animationDuration = `${duration}s`;
        heart.style.animationDelay = `${delay}s`;
        
        container.appendChild(heart);
    }
}

function createInteractiveRisingHeart(targetX) {
    const container = document.getElementById('rainHearts');
    if (!container) return;

    const heart = document.createElement('div');
    heart.classList.add('rising-heart');
    
    const size = Math.random() * 10 + 8;
    heart.style.width = `${size}px`;
    heart.style.height = `${size}px`;
    heart.style.left = `${targetX + (Math.random() * 80 - 40)}px`;
    
    // Tăng thời gian bay cho tim tương tác
    const duration = Math.random() * 3 + 6;
    heart.style.animationDuration = `${duration}s`;
    
    container.appendChild(heart);

    setTimeout(() => {
        heart.remove();
    }, duration * 1000);
}

// --- SAU KHI XÓA SƯƠNG: KẾT HỢP MƯA RƠI ĐỎ & VÀNG HOÀNG KIM ---
function startCombinedHeartsRain() {
    const container = document.getElementById('rainHearts');
    if (!container) return;

    // Tăng số lượng và phân bổ rõ ràng 50% đỏ, 50% vàng
    const heartCount = 40;
    for (let i = 0; i < heartCount; i++) {
        const heart = document.createElement('div');
        heart.classList.add('falling-heart');
        
        // Cứ xen kẽ chẵn/lẻ để chắc chắn có cả màu đỏ và màu vàng
        if (i % 2 === 0) {
            // Màu đỏ rực
            heart.style.backgroundColor = 'rgba(255, 45, 85, 0.9)';
            heart.style.boxShadow = '0 0 8px rgba(255, 45, 85, 0.6)';
        } else {
            // Màu vàng hoàng kim
            heart.style.backgroundColor = 'rgba(255, 215, 0, 0.9)';
            heart.style.boxShadow = '0 0 8px rgba(255, 215, 0, 0.6)';
        }
        
        const size = Math.random() * 12 + 8;
        heart.style.width = `${size}px`;
        heart.style.height = `${size}px`;
        heart.style.left = `${Math.random() * 100}vw`;
        
        // Thời gian rơi chậm rãi, thong thả (từ 5 đến 9 giây)
        const duration = Math.random() * 4 + 5;
        const delay = Math.random() * 6;
        heart.style.animationDuration = `${duration}s`;
        heart.style.animationDelay = `${delay}s`;
        
        container.appendChild(heart);
    }
}


// --- 4. HIỆU ỨNG PHÁO HOA TRÁI TIM 2 VÒNG SIÊU MƯỢT ---
const fwCanvas = document.getElementById('fireworksCanvas');
const fwCtx = fwCanvas ? fwCanvas.getContext('2d') : null;

function resizeFwCanvas() {
    if (!fwCanvas) return;
    fwCanvas.width = window.innerWidth;
    fwCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeFwCanvas);

class FireworkHeart {
    constructor(startX, startY, targetX, targetY) {
        this.x = startX;
        this.y = startY;
        this.targetX = targetX;
        this.targetY = targetY;
        this.speed = 1.8; // Bay lên thong thả, nhẹ nhàng
        this.angle = Math.atan2(targetY - startY, targetX - startX);
        this.distance = Math.hypot(targetX - startX, targetY - startY);
        this.traveled = 0;
        this.exploded = false;
        this.particles = [];
        this.trail = [];
    }

    update() {
        if (!this.exploded) {
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > 8) this.trail.shift();

            let vx = Math.cos(this.angle) * this.speed;
            let vy = Math.sin(this.angle) * this.speed;
            this.x += vx;
            this.y += vy;
            this.traveled += Math.hypot(vx, vy);

            if (this.traveled >= this.distance) {
                this.exploded = true;
                this.createHeartParticles();
            }
        } else {
            this.particles.forEach(p => p.update());
            this.particles = this.particles.filter(p => p.alpha > 0);
        }
    }

    draw() {
        if (!fwCtx) return;
        if (!this.exploded) {
            for (let i = 0; i < this.trail.length; i++) {
                let tPoint = this.trail[i];
                let alpha = (i + 1) / this.trail.length;
                fwCtx.save();
                fwCtx.globalAlpha = alpha * 0.6;
                fwCtx.fillStyle = '#ffdf73';
                fwCtx.beginPath();
                fwCtx.arc(tPoint.x, tPoint.y, 2, 0, Math.PI * 2);
                fwCtx.fill();
                fwCtx.restore();
            }

            fwCtx.save();
            fwCtx.fillStyle = '#fff';
            fwCtx.shadowColor = '#ffb6c1';
            fwCtx.shadowBlur = 6;
            fwCtx.beginPath();
            fwCtx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
            fwCtx.fill();
            fwCtx.restore();
        } else {
            this.particles.forEach(p => p.draw());
        }
    }

    createHeartParticles() {
        const particleCount = 140; // Tăng hạt để trái tim dày dặn khi nở to

        // 1. VÒNG NGOÀI (Đỏ rực, nở chậm rãi)
        for (let i = 0; i < particleCount; i++) {
            const t = (i / particleCount) * Math.PI * 2;
            const hx = 16 * Math.pow(Math.sin(t), 3);
            const hy = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
            
            // Giảm hệ số nở (từ 0.45 xuống 0.38) để pháo nở vừa tầm, không quá nhanh
            this.particles.push(new Particle(this.targetX, this.targetY, hx * 0.38, hy * 0.38, 'red'));
        }

        // 2. VÒNG TRONG (Vàng hoàng kim ôm trọn)
        for (let i = 0; i < particleCount; i++) {
            const t = (i / particleCount) * Math.PI * 2;
            const hx = 16 * Math.pow(Math.sin(t), 3);
            const hy = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
            
            this.particles.push(new Particle(this.targetX, this.targetY, hx * 0.25, hy * 0.25, 'gold'));
        }
    }
}

class Particle {
    constructor(x, y, vx, vy, type) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.alpha = 1.0;
        
        // GIẢM TỐC ĐỘ TAN (decay cực nhỏ từ 0.0015 đến 0.003) giúp pháo lơ lửng, tan chậm rất nên thơ
        this.decay = Math.random() * 0.0015 + 0.0015; 
        
        this.type = type;
        this.friction = 0.97; // Ma sát lớn hơn giúp các hạt trôi chậm lại mượt mà
        this.gravity = 0.002; // Trọng lực cực nhẹ để hạt lơ lửng lâu hơn trên không trung

        if (type === 'red') {
            this.color = 'rgba(255, 45, 85, 0.95)';
        } else {
            this.color = 'rgba(255, 215, 0, 0.95)';
        }
    }

    update() {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
    }

    draw() {
        if (!fwCtx) return;
        fwCtx.save();
        fwCtx.globalAlpha = Math.max(this.alpha, 0);
        fwCtx.fillStyle = this.color;
        fwCtx.shadowColor = this.color;
        fwCtx.shadowBlur = 8; // Tăng nhẹ độ lan tỏa ánh sáng để tạo hiệu ứng hào quang mờ ảo
        fwCtx.beginPath();
        fwCtx.arc(this.x, this.y, 1.1, 0, Math.PI * 2); // Giảm bán kính hạt xuống 1.1 để nét viền cực kỳ mảnh và mờ ảo
        fwCtx.fill();
        fwCtx.restore();
    }
}

let fireworks = [];

function loopFireworks() {
    if (!fwCtx || !fwCanvas) return;
    
    // Sử dụng kỹ thuật phủ mờ nhẹ thay vì xóa sạch hoàn toàn để tạo hiệu ứng lưu ảnh (motion blur) siêu mượt
    fwCtx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    fwCtx.fillRect(0, 0, fwCanvas.width, fwCanvas.height);
    // Hoặc làm sạch khung hình bằng clearRect nhưng kết hợp shadow mượt:
    fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);

    if (Math.random() < 0.02) {
        let startX = Math.random() * fwCanvas.width;
        let targetX = startX + (Math.random() * 200 - 100);
        let targetY = fwCanvas.height * 0.25 + Math.random() * 80;
        fireworks.push(new FireworkHeart(startX, fwCanvas.height, targetX, targetY));
    }

    fireworks.forEach(fw => {
        fw.update();
        fw.draw();
    });

    fireworks = fireworks.filter(fw => !fw.exploded || fw.particles.length > 0);

    requestAnimationFrame(loopFireworks);
}

// --- KHỞI CHẠY KHI TẢI TRANG ---
window.addEventListener('DOMContentLoaded', () => {
    resizeFogCanvas();
    createInitialRisingHearts();
    resizeFwCanvas();
    loopFireworks();
});