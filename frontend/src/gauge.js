// ============================================
// Risk Gauge — Canvas-based semicircle gauge
// ============================================

export function drawRiskGauge(score) {
  const canvas = document.getElementById('riskGauge');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  canvas.width = 200 * dpr;
  canvas.height = 120 * dpr;
  ctx.scale(dpr, dpr);

  const centerX = 100;
  const centerY = 105;
  const radius = 80;
  const startAngle = Math.PI;
  const endAngle = 2 * Math.PI;

  const scoreEl = document.getElementById('gaugeScore');
  let current = 0;

  function getColor(val) {
    if (val <= 35) return '#6B8E5A';
    if (val <= 65) return '#C4943D';
    return '#B85C4A';
  }

  function animate() {
    if (current <= score) {
      ctx.clearRect(0, 0, 200, 120);

      // Background arc
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.lineWidth = 14;
      ctx.strokeStyle = '#E8DFD2';
      ctx.lineCap = 'round';
      ctx.stroke();

      // Progress arc with gradient
      const progress = current / 100;
      const currentAngle = startAngle + progress * (endAngle - startAngle);
      const gradient = ctx.createLinearGradient(20, 0, 180, 0);
      gradient.addColorStop(0, '#6B8E5A');
      gradient.addColorStop(0.5, '#C4943D');
      gradient.addColorStop(1, '#B85C4A');

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, currentAngle);
      ctx.lineWidth = 14;
      ctx.strokeStyle = gradient;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Needle dot
      const dotX = centerX + radius * Math.cos(currentAngle);
      const dotY = centerY + radius * Math.sin(currentAngle);
      ctx.beginPath();
      ctx.arc(dotX, dotY, 6, 0, 2 * Math.PI);
      ctx.fillStyle = getColor(current);
      ctx.shadowColor = getColor(current);
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      scoreEl.textContent = current;
      scoreEl.style.color = getColor(current);
      current++;
      requestAnimationFrame(animate);
    }
  }
  animate();
}
