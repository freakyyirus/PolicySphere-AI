// ============================================
// Charts — Chart.js bar + radar visualizations
// ============================================

/* global Chart */

let impactChartInstance = null;
let radarChartInstance = null;

export function renderImpactChart(impacts) {
  const canvas = document.getElementById('impactChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  if (impactChartInstance) impactChartInstance.destroy();

  const labels = ['Inflation', 'Employment', 'GDP Growth', 'Fiscal Deficit'];
  const values = [impacts.inflation, impacts.employment, impacts.gdp, impacts.fiscal];
  const colors = values.map(v => v > 0.5 ? 'rgba(184,92,74,0.8)' : v < -0.5 ? 'rgba(107,142,90,0.8)' : 'rgba(196,148,61,0.8)');
  const borders = values.map(v => v > 0.5 ? '#B85C4A' : v < -0.5 ? '#6B8E5A' : '#C4943D');

  impactChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Impact (%)',
        data: values,
        backgroundColor: colors,
        borderColor: borders,
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#3D3528',
          titleColor: '#FDFBF7',
          bodyColor: '#EDE6D9',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
        }
      },
      scales: {
        x: {
          ticks: { color: '#6B5E4A', font: { family: 'Inter', size: 11 } },
          grid: { display: false },
        },
        y: {
          ticks: { color: '#6B5E4A', font: { family: 'Inter', size: 11 }, callback: v => v + '%' },
          grid: { color: '#D4C9B8' },
        }
      },
      animation: { duration: 1200, easing: 'easeOutQuart' },
    }
  });
}

export function renderRadarChart(result) {
  const canvas = document.getElementById('radarChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  if (radarChartInstance) radarChartInstance.destroy();

  const { impacts, sensitivity } = result;

  radarChartInstance = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Inflation Risk', 'Employment Risk', 'GDP Risk', 'Fiscal Risk', 'Sector Sensitivity'],
      datasets: [{
        label: 'Risk Profile',
        data: [
          Math.abs(impacts.inflation) * 10,
          Math.abs(impacts.employment) * 10,
          Math.abs(impacts.gdp) * 10,
          Math.abs(impacts.fiscal) * 10,
          sensitivity * 100,
        ],
        backgroundColor: 'rgba(139,115,85,0.15)',
        borderColor: '#8B7355',
        borderWidth: 2,
        pointBackgroundColor: '#8B7355',
        pointBorderColor: '#fff',
        pointBorderWidth: 1,
        pointRadius: 4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { display: false } },
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: { display: false, stepSize: 20 },
          grid: { color: '#D4C9B8' },
          angleLines: { color: '#D4C9B8' },
          pointLabels: { color: '#6B5E4A', font: { family: 'Inter', size: 10 } },
        }
      },
      animation: { duration: 1000, easing: 'easeOutQuart' },
    }
  });
}
