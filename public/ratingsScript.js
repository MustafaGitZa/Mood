// Global chart reference
let moodBarChart = null;

// Add legend styles and creation function
const legendStyles = `
  .mood-legend {
    position: fixed;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    border: 1px solid rgba(255, 255, 255, 0.3);
    font-family: Arial, sans-serif;
  }
  .mood-legend h3 {
    margin-top: 0;
    margin-bottom: 10px;
    font-size: 16px;
    color: #fff;
  }
  .legend-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    font-size: 14px;
    color: #fff;
  }
  .legend-color {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    margin-right: 10px;
    border: 1px solid #ddd;
  }
`;

function createMoodLegend() {
  const styleElement = document.createElement('style');
  styleElement.textContent = legendStyles;
  document.head.appendChild(styleElement);

  const legend = document.createElement('div');
  legend.className = 'mood-legend';
  legend.innerHTML = `
    <h3>Mood Legend</h3>
    <div class="legend-item"><div class="legend-color" style="background-color: #4CAF50;"></div><span>Happy</span></div>
    <div class="legend-item"><div class="legend-color" style="background-color: #FFEB3B;"></div><span>Sad</span></div>
    <div class="legend-item"><div class="legend-color" style="background-color: #FF5722;"></div><span>Angry</span></div>
    <div class="legend-item"><div class="legend-color" style="background-color: #2196F3;"></div><span>Excited</span></div>
    <div class="legend-item"><div class="legend-color" style="background-color: #9E9E9E;"></div><span>Neutral</span></div>
    <div class="legend-item"><div class="legend-color" style="background-color: #9C27B0;"></div><span>Surprised</span></div>
  `;
  document.body.appendChild(legend);
}

function populateMoodTable(historyData) {
  const tableBody = document.getElementById('moodTable').getElementsByTagName('tbody')[0];
  tableBody.innerHTML = '';

  if (!historyData || historyData.length === 0) {
    const row = tableBody.insertRow();
    const cell = row.insertCell(0);
    cell.colSpan = 3;
    cell.textContent = "No mood entries found for selected period";
    cell.style.textAlign = "center";
    return;
  }

  historyData.forEach(entry => {
    const row = tableBody.insertRow();
    const dateCell = row.insertCell(0);
    const moodCell = row.insertCell(1);
    const timestampCell = row.insertCell(2);

    try {
      dateCell.textContent = new Date(entry.dateTime).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      timestampCell.textContent = new Date(entry.dateTime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      dateCell.textContent = entry.dateTime;
      timestampCell.textContent = entry.dateTime;
    }

    const emojiMap = {
      Happy: '😊',
      Sad: '😢',
      Angry: '😠',
      Excited: '🤩',
      Neutral: '😐',
      Surprised: '😲'
    };
    moodCell.textContent = `${entry.emotion} ${emojiMap[entry.emotion] || ''}`;
  });

  document.querySelector('.chart-container').classList.add('blurred');
  document.getElementById('moodTableContainer').style.display = 'block';
  document.getElementById('backToChartButton').style.display = 'inline-block';
}

// Modified chart function to use raw counts
function initializeChart(counts) {
  const numericCounts = {
    happy: parseInt(counts.happy) || 0,
    sad: parseInt(counts.sad) || 0,
    angry: parseInt(counts.angry) || 0,
    excited: parseInt(counts.excited) || 0,
    neutral: parseInt(counts.neutral) || 0,
    surprised: parseInt(counts.surprised) || 0
  };

  const ctx = document.getElementById('moodChart').getContext('2d');

  if (moodBarChart) {
    moodBarChart.destroy();
  }

  moodBarChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Happy', 'Sad', 'Angry', 'Excited', 'Neutral', 'Surprised'],
      datasets: [{
        label: 'Mood Count',
        data: Object.values(numericCounts),
        backgroundColor: [
          '#4CAF50', '#FFEB3B', '#FF5722',
          '#2196F3', '#9E9E9E', '#9C27B0'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: (tooltipItem) => `${tooltipItem.raw} moods`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Mood Count'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Mood Type'
          }
        }
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    createMoodLegend();

    const response = await fetch('/ratings');
    if (!response.ok) throw new Error('Failed to fetch initial data');

    const data = await response.json();
    console.log("Initial data:", data);

    const moodCounts = data.moodCounts[0];
    initializeChart(moodCounts);

    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    document.getElementById('startDate').valueAsDate = firstDay;
    document.getElementById('endDate').valueAsDate = lastDay;
  } catch (error) {
    console.error('Initialization error:', error);
    alert('Failed to initialize. Please check console for details.');
  }
});

document.getElementById('dateFilterForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;

  try {
    const response = await fetch(`/ratings?start=${startDate}&end=${endDate}`);
    if (!response.ok) throw new Error('Failed to fetch filtered data');

    const data = await response.json();
    console.log("Filtered data:", data);

    const moodCounts = data.moodCounts[0];
    initializeChart(moodCounts);
    populateMoodTable(data.individualMoods);
  } catch (error) {
    console.error('Filter error:', error);
    alert('Error applying filter. Please check console for details.');
  }
});

document.getElementById('backToChartButton').addEventListener('click', function () {
  document.getElementById('moodTableContainer').style.display = 'none';
  document.querySelector('.chart-container').classList.remove('blurred');
  this.style.display = 'none';
});
