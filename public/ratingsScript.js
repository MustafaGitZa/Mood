 // Fetch mood ratings for the logged-in user
 fetch('/ratings')
 .then(response => response.json())
 .then(data => {
   const moodPercentages = data;

   // Prepare data for the chart
   const ctx = document.getElementById('moodChart').getContext('2d');
   const moodChart = new Chart(ctx, {
     type: 'bar',
     data: {
       labels: ['Happy', 'Sad', 'Angry', 'Excited'],
       datasets: [{
         label: 'Mood Ratings (%)',
         data: [
           moodPercentages.happy,
           moodPercentages.sad,
           moodPercentages.angry,
           moodPercentages.excited
         ],
         backgroundColor: ['#4CAF50', '#FFEB3B', '#FF5722', '#2196F3'],
         borderColor: ['#4CAF50', '#FFEB3B', '#FF5722', '#2196F3'],
         borderWidth: 1,
         hoverBackgroundColor: ['#45a049', '#f1c40f', '#e64a19', '#1976d2'],
       }]
     },
     options: {
       responsive: true,
       maintainAspectRatio: false,
       scales: {
         y: {
           min: 0,
           max: 100,
           ticks: {
             stepSize: 10,
             callback: function(value) {
               return value + '%';
             }
           },
           title: {
             display: true,
             text: 'Percentage (%)',
             font: {
               size: 16
             },
             color: '#333'
           }
         },
         x: {
           title: {
             display: true,
             text: 'Mood Type',
             font: {
               size: 16
             },
             color: '#333'
           }
         }
       },
       plugins: {
         tooltip: {
           callbacks: {
             label: function(tooltipItem) {
               return tooltipItem.raw + '%';
             }
           }
         }
       },
       legend: {
         display: false
       }
     }
   });
 })
 .catch(error => {
   console.error('Error fetching mood ratings:', error);
 });