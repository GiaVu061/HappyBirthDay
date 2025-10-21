// Typing effect for custom message
const messageElement = document.getElementById("message");
const customMessage =
   "Wishing you a birthday filled with love, laughter, and unforgettable moments. May the year ahead bring you endless joy, success, and everything your heart desires. 🎂";
let index = 0;

// Hàm bắt đầu hiệu ứng đánh máy
function typeMessage() {
   if (index < customMessage.length) {
      messageElement.textContent += customMessage.charAt(index);
      index++;
      setTimeout(typeMessage, 50);
   } else {
      // KHI TYPING KẾT THÚC -> BẮT ĐẦU THẢ BÓNG BAY LIÊN TỤC
      startContinuousBalloonLaunch();
   }
}

window.onload = function () {
   typeMessage();
};

// Fireworks and Balloons setup
const canvas = document.getElementById("fireworks");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
   canvas.width = window.innerWidth;
   canvas.height = window.innerHeight;
});

function random(min, max) {
   return Math.random() * (max - min) + min;
}

// --- LỚP BÓNG BAY ---
class Balloon {
   constructor() {
      this.radiusX = random(20, 30); // Bán kính ngang
      this.radiusY = this.radiusX * random(1.3, 1.6); // Bán kính dọc lớn hơn
      this.x = random(this.radiusX, canvas.width - this.radiusX);
      this.y = canvas.height + this.radiusY;
      this.speed = random(0.8, 1.5);

      this.color = `hsl(${random(0, 360)}, ${random(70, 90)}%, ${random(50, 75)}%)`;
      this.alpha = 1;
   }

   update() {
      // Bay thẳng lên (chỉ giảm y)
      this.y -= this.speed;

      // Hiệu ứng mờ dần: Giảm alpha khi bay lên cao
      if (this.y < canvas.height * 0.5) {
         this.alpha = Math.max(0, this.alpha - 0.003);
      }
   }

   draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;

      // 1. Vẽ bóng (hình elip)
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, this.radiusX, this.radiusY, 0, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();

      // 2. Vẽ nút thắt
      const knotY = this.y + this.radiusY;
      ctx.beginPath();
      ctx.moveTo(this.x, knotY);
      ctx.lineTo(this.x + 3, knotY + 5);
      ctx.lineTo(this.x - 3, knotY + 5);
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fill();

      // 3. Vẽ dây buộc
      const stringStart = knotY + 5;
      ctx.beginPath();
      ctx.moveTo(this.x, stringStart);
      ctx.lineTo(this.x, stringStart + 30);
      ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
   }
}

// --- LỚP PHÁO HOA VÀ HẠT (ROLLBACK VỀ LOGIC ĐƠN GIẢN) ---
class Firework {
   constructor() {
      this.x = random(0, canvas.width);
      this.y = canvas.height;
      this.targetY = random(50, canvas.height * 0.5);
      this.speed = random(2, 5);
      this.color = `hsl(${random(0, 360)}, 100%, 50%)`;
      this.particles = [];
      this.exploded = false;
      // Đã loại bỏ trailLength và trail array
   }

   update() {
      if (!this.exploded) {
         this.y -= this.speed;
         if (this.y <= this.targetY) {
            this.explode();
         }
      } else {
         this.particles.forEach((p) => p.update());
         this.particles = this.particles.filter((p) => p.alpha > 0);
      }
   }

   draw() {
      if (!this.exploded) {
         // Chỉ vẽ đầu pháo hoa, vệt sáng do animate() xử lý
         ctx.beginPath();
         ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
         ctx.fillStyle = this.color;
         ctx.fill();
      } else {
         this.particles.forEach((p) => p.draw());
      }
   }

   explode() {
      this.exploded = true;
      for (let i = 0; i < 30; i++) {
         this.particles.push(new Particle(this.x, this.y, this.color));
      }
   }
}

class Particle {
   constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.speed = random(1, 5);
      this.angle = random(0, Math.PI * 2);
      this.alpha = 1;
      this.fade = random(0.01, 0.03); // Tốc độ mờ dần của hạt pháo hoa
   }

   update() {
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;
      this.alpha -= this.fade;
   }

   draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
   }
}

// --- LOGIC CHÍNH VÀ LẶP LẠI BÓNG BAY ---
const FIREWORK_FREQUENCY = 0.05;
const BALLOON_BATCH_SIZE_MIN = 4;
const BALLOON_BATCH_SIZE_MAX = 5;
const BALLOON_LAUNCH_INTERVAL_MS = 15000; // Thả một đợt bóng bay mới sau 6 giây

let fireworks = [];
let balloons = [];

/**
 * Thả một đợt bóng bay (4-5 quả) sau đó tự gọi lại chính nó sau một khoảng thời gian.
 */
function launchBalloonBatch() {
   const numBalloons = random(BALLOON_BATCH_SIZE_MIN, BALLOON_BATCH_SIZE_MAX);
   for (let i = 0; i < numBalloons; i++) {
      // Tạo bóng với độ trễ nhỏ để không xuất hiện cùng lúc
      setTimeout(() => {
         balloons.push(new Balloon());
      }, i * 400);
   }

   // Thiết lập để thả đợt bóng bay tiếp theo
   setTimeout(launchBalloonBatch, BALLOON_LAUNCH_INTERVAL_MS);
}

// Hàm này được gọi sau khi typing xong
function startContinuousBalloonLaunch() {
   launchBalloonBatch();
}

function animate() {
   // Xóa canvas một phần để tạo VỆT SÁNG PHÁO HOA
   ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
   ctx.fillRect(0, 0, canvas.width, canvas.height);

   // Logic Pháo hoa
   if (Math.random() < FIREWORK_FREQUENCY) {
      fireworks.push(new Firework());
   }
   fireworks.forEach((f) => {
      f.update();
      f.draw();
   });
   fireworks = fireworks.filter((f) => !f.exploded || f.particles.length > 0);

   // Logic Bóng bay
   balloons.forEach((b) => {
      b.update();
      b.draw();
   });
   // Lọc bỏ khi alpha về 0 (đã mờ dần) hoặc bay hoàn toàn khỏi màn hình
   balloons = balloons.filter((b) => b.y + b.radiusY > 0 && b.alpha > 0);

   requestAnimationFrame(animate);
}

animate();
