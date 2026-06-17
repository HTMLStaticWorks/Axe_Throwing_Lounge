/* 
   VALKYRIE AXES & LOUNGE - Dashboard Script
   Handles user profile, bookings history, Admin Analytics, and Chart.js integrations.
*/

document.addEventListener('DOMContentLoaded', () => {
  // Initialize mock data in localstorage if not present
  initMockData();

  if (document.getElementById('user-dashboard-view')) {
    initUserDashboard();
  }

  if (document.getElementById('admin-dashboard-view')) {
    initAdminDashboard();
  }
});

/* ==========================================
   1. Mock Data Initializer
   ========================================== */
function initMockData() {
  let bookings = localStorage.getItem('bookings');
  if (!bookings) {
    const defaultBookings = [
      {
        id: 'VX-582910',
        eventType: 'Corporate Team Event',
        date: '2026-06-24',
        time: '4:00 PM',
        guests: 12,
        deposit: 300.00,
        status: 'Confirmed'
      },
      {
        id: 'VX-982103',
        eventType: 'Bachelor Party',
        date: '2026-07-02',
        time: '8:00 PM',
        guests: 8,
        deposit: 200.00,
        status: 'Pending Approval'
      },
      {
        id: 'VX-213904',
        eventType: 'Open Lane Session',
        date: '2026-05-18',
        time: '7:30 PM',
        guests: 4,
        deposit: 100.00,
        status: 'Completed'
      }
    ];
    localStorage.setItem('bookings', JSON.stringify(defaultBookings));
  }
}

/* ==========================================
   2. User Dashboard Script
   ========================================== */
function initUserDashboard() {
  const bookingsTable = document.getElementById('user-bookings-body');
  if (!bookingsTable) return;

  renderUserBookings();

  // Handle profile form saving
  const profileForm = document.getElementById('user-profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Profile updated successfully!');
    });
  }
}

function renderUserBookings() {
  const bookingsTable = document.getElementById('user-bookings-body');
  if (!bookingsTable) return;

  const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
  bookingsTable.innerHTML = '';

  if (bookings.length === 0) {
    bookingsTable.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No reservations found. <a href="booking.html" class="text-primary">Book a lane now!</a></td></tr>`;
    return;
  }

  bookings.forEach(booking => {
    let statusClass = 'bg-secondary';
    if (booking.status === 'Confirmed') statusClass = 'bg-success text-dark';
    if (booking.status === 'Pending Approval') statusClass = 'bg-warning text-dark';
    if (booking.status === 'Completed') statusClass = 'bg-info text-dark';
    if (booking.status === 'Cancelled') statusClass = 'bg-danger';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><span class="font-monospace text-primary fw-bold">${booking.id}</span></td>
      <td>${booking.eventType}</td>
      <td>${booking.date}</td>
      <td>${booking.time}</td>
      <td>${booking.guests} Players</td>
      <td><span class="badge ${statusClass}">${booking.status}</span></td>
      <td>
        ${booking.status !== 'Cancelled' && booking.status !== 'Completed' ? 
          `<button class="btn btn-sm btn-outline-danger py-1 px-2" onclick="cancelBooking('${booking.id}')">Cancel</button>` : 
          `<span class="text-muted">-</span>`
        }
      </td>
    `;
    bookingsTable.appendChild(row);
  });

  // Update Summary Cards
  const activeBookings = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Pending Approval').length;
  const totalVisits = bookings.filter(b => b.status === 'Completed').length;
  
  const activeBookingsEl = document.getElementById('dash-active-bookings');
  if (activeBookingsEl) activeBookingsEl.textContent = activeBookings;

  const totalVisitsEl = document.getElementById('dash-total-visits');
  if (totalVisitsEl) totalVisitsEl.textContent = totalVisits;
}

// Global scope bindings for row action elements
window.cancelBooking = function(bookingId) {
  if (confirm(`Are you sure you want to cancel booking ${bookingId}?`)) {
    let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    bookings = bookings.map(b => {
      if (b.id === bookingId) {
        b.status = 'Cancelled';
      }
      return b;
    });
    localStorage.setItem('bookings', JSON.stringify(bookings));
    renderUserBookings();
    if (document.getElementById('admin-dashboard-view')) {
      renderAdminBookings();
      renderAdminCharts();
    }
  }
};

/* ==========================================
   3. Admin Dashboard Script
   ========================================== */
function initAdminDashboard() {
  renderAdminBookings();
  renderAdminCharts();
}

function renderAdminBookings() {
  const adminTable = document.getElementById('admin-bookings-body');
  if (!adminTable) return;

  const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
  adminTable.innerHTML = '';

  if (bookings.length === 0) {
    adminTable.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No reservations in database.</td></tr>`;
    return;
  }

  bookings.forEach(booking => {
    let statusClass = 'bg-secondary';
    if (booking.status === 'Confirmed') statusClass = 'bg-success text-dark';
    if (booking.status === 'Pending Approval') statusClass = 'bg-warning text-dark';
    if (booking.status === 'Completed') statusClass = 'bg-info text-dark';
    if (booking.status === 'Cancelled') statusClass = 'bg-danger';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><span class="font-monospace text-primary fw-bold">${booking.id}</span></td>
      <td>${booking.eventType}</td>
      <td>${booking.date}</td>
      <td>${booking.time}</td>
      <td>${booking.guests}</td>
      <td><span class="badge ${statusClass}">${booking.status}</span></td>
      <td>
        ${booking.status === 'Pending Approval' ? 
          `<button class="btn btn-xs btn-success py-0 px-2 me-1" onclick="approveBooking('${booking.id}')">Approve</button>` : ''
        }
        ${booking.status !== 'Cancelled' && booking.status !== 'Completed' ? 
          `<button class="btn btn-xs btn-danger py-0 px-2" onclick="cancelBooking('${booking.id}')">Cancel</button>` : 
          `<span class="text-muted">-</span>`
        }
      </td>
    `;
    adminTable.appendChild(row);
  });

  // Update Stats Box
  const totalRevenue = bookings.filter(b => b.status !== 'Cancelled').reduce((acc, curr) => acc + curr.deposit, 0);
  const activeLanes = Math.min(10, bookings.filter(b => b.status === 'Confirmed').length * 2);
  
  const revEl = document.getElementById('admin-revenue');
  if (revEl) revEl.textContent = `$${totalRevenue.toFixed(2)}`;

  const laneEl = document.getElementById('admin-active-lanes');
  if (laneEl) laneEl.textContent = `${activeLanes}/10`;

  const totalBookingsEl = document.getElementById('admin-total-bookings');
  if (totalBookingsEl) totalBookingsEl.textContent = bookings.length;
}

window.approveBooking = function(bookingId) {
  let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
  bookings = bookings.map(b => {
    if (b.id === bookingId) {
      b.status = 'Confirmed';
    }
    return b;
  });
  localStorage.setItem('bookings', JSON.stringify(bookings));
  renderAdminBookings();
};

/* ==========================================
   4. Render Admin Analytics Charts
   ========================================== */
let revenueChart, bookingsChart;

function renderAdminCharts() {
  const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
  
  // 1. Revenue Chart
  const revCanvas = document.getElementById('revenueChart');
  if (revCanvas) {
    if (revenueChart) revenueChart.destroy();
    
    // Sum deposits by month
    const ctx = revCanvas.getContext('2d');
    revenueChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [{
          label: 'Monthly Revenue ($)',
          data: [1200, 1900, 2400, 1800, 2800, 3400, 4200],
          borderColor: '#FF5E00',
          backgroundColor: 'rgba(255, 94, 0, 0.1)',
          tension: 0.3,
          fill: true,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#888' } },
          x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#888' } }
        }
      }
    });
  }

  // 2. Bookings Distribution Chart
  const bookingsCanvas = document.getElementById('bookingsChart');
  if (bookingsCanvas) {
    if (bookingsChart) bookingsChart.destroy();

    // Group count by event type
    const counts = {
      'Corporate': 0,
      'Bachelor/Bachelorette': 0,
      'Open Lane': 0,
      'Group Experience': 0
    };

    bookings.forEach(b => {
      if (b.eventType.includes('Corporate')) counts['Corporate']++;
      else if (b.eventType.includes('Bachelor')) counts['Bachelor/Bachelorette']++;
      else if (b.eventType.includes('Open')) counts['Open Lane']++;
      else counts['Group Experience']++;
    });

    const ctx = bookingsCanvas.getContext('2d');
    bookingsChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(counts),
        datasets: [{
          data: Object.values(counts),
          backgroundColor: ['#FF5E00', '#FF8C32', '#33b5e5', '#00C851'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#A0A5B5' }
          }
        }
      }
    });
  }
}
