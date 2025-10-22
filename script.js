// Navigation handling
const navItems = document.querySelectorAll('.nav-item');

navItems.forEach(item => {
  item.addEventListener('click', () => {
    navItems.forEach(nav => nav.classList.remove('active'));
    item.classList.add('active');
    
    // Load respective dashboard content
    const section = item.getAttribute('data-nav');
    loadDashboardSection(section);
  });
});

// Show/hide dashboard sections based on navigation
function showDashboardSections(sectionName) {
  const allSections = document.querySelectorAll('.dashboard-section');
  
  if (sectionName === 'home' || sectionName === 'executive') {
    // Show all sections for home/executive
    allSections.forEach(section => {
      section.classList.remove('hidden');
    });
    updateBreadcrumb('All Sections');
  } else {
    // Hide all sections first
    allSections.forEach(section => {
      section.classList.add('hidden');
    });
    
    // Show only matching sections
    allSections.forEach(section => {
      const sectionData = section.getAttribute('data-section');
      if (sectionData && sectionData.includes(sectionName)) {
        section.classList.remove('hidden');
      }
    });
    
    // Update breadcrumb with section name
    const sectionTitle = sectionName.charAt(0).toUpperCase() + sectionName.slice(1).replace('-', ' ');
    updateBreadcrumb(sectionTitle);
  }
  
  // Scroll to top smoothly
  document.querySelector('.main').scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// Update breadcrumb
function updateBreadcrumb(currentSection) {
  const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
  if (breadcrumbCurrent) {
    breadcrumbCurrent.textContent = currentSection;
  }
}

// Load dashboard sections
function loadDashboardSection(section) {
  showLoading(true);
  console.log(`Loading ${section} dashboard...`);
  
  setTimeout(() => {
    showDashboardSections(section);
    showLoading(false);
    
    const sectionTitle = section.charAt(0).toUpperCase() + section.slice(1).replace('-', ' ');
    if (section === 'executive') {
      showAlert('Showing all dashboard sections', 'success');
    } else {
      showAlert(`${sectionTitle} dashboard loaded`, 'success');
    }
  }, 500);
}

// Pagination state
const paginationState = {
  leadership: {
    currentPage: 1,
    itemsPerPage: 6,
    totalItems: 0,
    filteredItems: []
  }
};

// Initialize pagination
function initializePagination(section) {
  const listElement = document.getElementById(`${section}List`);
  if (!listElement) return;
  
  const items = Array.from(listElement.querySelectorAll('.list-item'));
  paginationState[section].totalItems = items.length;
  paginationState[section].filteredItems = items;
  
  renderPagination(section);
}

// Render pagination for a section
function renderPagination(section) {
  const state = paginationState[section];
  const totalPages = Math.ceil(state.filteredItems.length / state.itemsPerPage);
  
  // Update items display
  state.filteredItems.forEach((item, index) => {
    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const endIndex = startIndex + state.itemsPerPage;
    
    if (index >= startIndex && index < endIndex) {
      item.style.display = 'flex';
      item.classList.add('fade-in');
    } else {
      item.style.display = 'none';
      item.classList.remove('fade-in');
    }
  });
  
  // Update pagination info
  const startItem = state.filteredItems.length === 0 ? 0 : (state.currentPage - 1) * state.itemsPerPage + 1;
  const endItem = Math.min(state.currentPage * state.itemsPerPage, state.filteredItems.length);
  const infoElement = document.getElementById('paginationInfo');
  if (infoElement) {
    infoElement.textContent = `Showing ${startItem}-${endItem} of ${state.filteredItems.length} items`;
  }
  
  // Update pagination buttons
  const paginationElement = document.getElementById(`${section}Pagination`);
  if (paginationElement && totalPages > 1) {
    let buttonsHTML = `<button class="pagination-btn" onclick="changePage('${section}', 'prev')" ${state.currentPage === 1 ? 'disabled' : ''}>Previous</button>`;
    
    // Generate page buttons
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= state.currentPage - 1 && i <= state.currentPage + 1)) {
        buttonsHTML += `<button class="pagination-btn ${i === state.currentPage ? 'active' : ''}" onclick="goToPage('${section}', ${i})">${i}</button>`;
      } else if (i === state.currentPage - 2 || i === state.currentPage + 2) {
        buttonsHTML += `<span class="pagination-dots">...</span>`;
      }
    }
    
    buttonsHTML += `<button class="pagination-btn" onclick="changePage('${section}', 'next')" ${state.currentPage === totalPages ? 'disabled' : ''}>Next</button>`;
    paginationElement.innerHTML = buttonsHTML;
  }
}

// Change page
function changePage(section, direction) {
  const state = paginationState[section];
  const totalPages = Math.ceil(state.filteredItems.length / state.itemsPerPage);
  
  if (direction === 'prev' && state.currentPage > 1) {
    state.currentPage--;
  } else if (direction === 'next' && state.currentPage < totalPages) {
    state.currentPage++;
  }
  
  renderPagination(section);
}

// Go to specific page
function goToPage(section, page) {
  paginationState[section].currentPage = page;
  renderPagination(section);
}

// Change items per page
function changeItemsPerPage(section, itemsPerPage) {
  paginationState[section].itemsPerPage = parseInt(itemsPerPage);
  paginationState[section].currentPage = 1; // Reset to first page
  renderPagination(section);
}

// Show alert messages
function showAlert(message, type = 'success') {
  const alertContainer = document.getElementById('alertContainer');
  if (!alertContainer) return;
  
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  
  alertContainer.appendChild(alert);
  
  setTimeout(() => {
    alert.style.opacity = '0';
    setTimeout(() => alert.remove(), 300);
  }, 5000);
}

// Search functionality
function handleSearch() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const sections = document.querySelectorAll('.dashboard-section');
  let hasResults = false;
  
  if (searchTerm === '') {
    // Show all sections if search is empty
    sections.forEach(section => {
      section.classList.remove('hidden');
    });
    return;
  }
  
  sections.forEach(section => {
    const text = section.textContent.toLowerCase();
    if (text.includes(searchTerm)) {
      section.classList.remove('hidden');
      hasResults = true;
    } else {
      section.classList.add('hidden');
    }
  });
  
  if (!hasResults) {
    showAlert('No results found', 'warning');
  }
}

// Filter leadership items
function filterLeadership(category) {
  const listElement = document.getElementById('leadershipList');
  const items = Array.from(listElement.querySelectorAll('.leadership-item'));
  const buttons = event.target.parentElement.querySelectorAll('.filter-btn');
  
  buttons.forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  
  // Filter items based on category
  const filteredItems = items.filter(item => {
    const itemCategory = item.getAttribute('data-category');
    return category === 'all' || itemCategory === category || itemCategory === 'all';
  });
  
  // Update pagination state with filtered items
  paginationState.leadership.filteredItems = filteredItems;
  paginationState.leadership.currentPage = 1; // Reset to first page
  
  // Hide all items first
  items.forEach(item => item.style.display = 'none');
  
  // Render pagination with filtered items
  renderPagination('leadership');
  
  showAlert(`Showing ${filteredItems.length} ${category} items`, 'success');
}

// Filter feedback
function filterFeedback(type) {
  const buttons = event.target.parentElement.querySelectorAll('.filter-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  
  showAlert(`Showing ${type} feedback`, 'success');
}

// Modal functions
function addLeadershipItem() {
  document.getElementById('modal').style.display = 'block';
  document.getElementById('modalTitle').textContent = 'Add New Leadership Item';
}

function closeModal() {
  const modal = document.getElementById('modal');
  const modalForm = document.getElementById('modalForm');
  
  // Remove any injected content
  const helpDiv = document.getElementById('helpContentDiv');
  const profileDiv = document.getElementById('profileContentDiv');
  const settingsDiv = document.getElementById('settingsContentDiv');
  const notificationDiv = document.getElementById('notificationContentDiv');
  const securityDiv = document.getElementById('securityContentDiv');
  
  if (helpDiv) helpDiv.remove();
  if (profileDiv) profileDiv.remove();
  if (settingsDiv) settingsDiv.remove();
  if (notificationDiv) notificationDiv.remove();
  if (securityDiv) securityDiv.remove();
  
  // Reset modal
  if (modal) {
    modal.style.display = 'none';
  }
  if (modalForm) {
    modalForm.style.display = 'block';
    modalForm.reset();
  }
  
  // Reset modal title
  const modalTitle = document.getElementById('modalTitle');
  if (modalTitle) {
    modalTitle.textContent = 'Add New Item';
  }
}

function handleFormSubmit(event) {
  event.preventDefault();
  
  const title = document.getElementById('itemTitle').value;
  const date = document.getElementById('itemDate').value;
  const category = document.getElementById('itemCategory').value;
  
  // Add new item to the list
  const leadershipList = document.getElementById('leadershipList');
  const newItem = document.createElement('div');
  newItem.className = 'leadership-item tooltip';
  newItem.setAttribute('data-category', category);
  newItem.innerHTML = `
    <div class="leadership-left">
      <div class="leadership-icon">📅</div>
      <div class="leadership-text">${title}</div>
    </div>
    <span class="leadership-badge">${new Date(date).toLocaleDateString()}</span>
    <span class="tooltiptext">Click to view full details</span>
  `;
  
  leadershipList.appendChild(newItem);
  
  showAlert('Item added successfully!', 'success');
  closeModal();
}

// Update progress functionality
function updateProgress() {
  const electricity = prompt('Enter Electricity progress (0-100):', '80');
  const transport = prompt('Enter Transport progress (0-100):', '56');
  const water = prompt('Enter Water progress (0-100):', '25');
  
  if (electricity !== null && electricity !== '') {
    document.getElementById('electricityProgress').textContent = electricity + '%';
    document.getElementById('electricityBar').style.width = electricity + '%';
  }
  if (transport !== null && transport !== '') {
    document.getElementById('transportProgress').textContent = transport + '%';
    document.getElementById('transportBar').style.width = transport + '%';
  }
  if (water !== null && water !== '') {
    document.getElementById('waterProgress').textContent = water + '%';
    document.getElementById('waterBar').style.width = water + '%';
  }
  
  showAlert('Progress updated successfully!', 'success');
}

// Export data functionality
function exportData(section) {
  showLoading(true);
  
  setTimeout(() => {
    // Simulate export
    const data = {
      section: section,
      timestamp: new Date().toISOString(),
      exported: true,
      data: collectSectionData(section)
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${section}-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showLoading(false);
    showAlert(`${section} data exported successfully!`, 'success');
  }, 1000);
}

// Collect section data for export
function collectSectionData(section) {
  const data = {};
  
  switch(section) {
    case 'leadership':
      const items = document.querySelectorAll('#leadershipList .leadership-item');
      data.items = Array.from(items).map(item => ({
        text: item.querySelector('.leadership-text').textContent,
        badge: item.querySelector('.leadership-badge').textContent
      }));
      break;
    case 'vulindlela':
      data.electricity = document.getElementById('electricityProgress').textContent;
      data.transport = document.getElementById('transportProgress').textContent;
      data.water = document.getElementById('waterProgress').textContent;
      break;
    case 'analytics':
      data.healthStat1 = document.getElementById('healthStat1').textContent;
      data.healthStat2 = document.getElementById('healthStat2').textContent;
      data.totalResponses = document.getElementById('totalResponses').textContent;
      break;
    default:
      data.message = 'Section data collected';
  }
  
  return data;
}

// Refresh analytics
function refreshAnalytics() {
  showLoading(true);
  
  setTimeout(() => {
    document.getElementById('healthStat1').textContent = (Math.random() * 3 + 2).toFixed(1) + 'M';
    document.getElementById('healthStat2').textContent = (Math.random() * 5 + 95).toFixed(1) + '%';
    document.getElementById('totalResponses').textContent = Math.floor(Math.random() * 5000 + 10000).toLocaleString();
    
    showLoading(false);
    showAlert('Analytics refreshed successfully!', 'success');
  }, 1500);
}

// Show/hide loading indicator
function showLoading(show) {
  const loadingIndicator = document.getElementById('loadingIndicator');
  if (loadingIndicator) {
    loadingIndicator.style.display = show ? 'block' : 'none';
  }
}

// Header navigation functions
function showHome(event) {
  if (event) event.preventDefault();
  
  // Reset to home view - show all sections
  showDashboardSections('home');
  
  // Set executive nav as active
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(nav => nav.classList.remove('active'));
  const executiveNav = document.querySelector('.nav-item[data-nav="executive"]');
  if (executiveNav) {
    executiveNav.classList.add('active');
  }
  
  // Update header nav active state
  updateHeaderNavActive('homeLink');
  
  showAlert('Showing all dashboard sections', 'success');
}

function showHelp(event) {
  if (event) event.preventDefault();
  
  // Update header nav active state
  updateHeaderNavActive('helpLink');
  
  // Create help modal
  const helpContent = `
    <div class="help-content">
      <h3 style="color: #1e3a8a; margin-bottom: 16px;">📚 Help Center</h3>
      <div style="margin-bottom: 20px;">
        <h4 style="color: #1f2937; margin-bottom: 8px;">Navigation</h4>
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
          • Click sidebar items to view specific sections<br>
          • Click "Home" to view all sections<br>
          • Use the search bar (Ctrl+K) to find content
        </p>
      </div>
      <div style="margin-bottom: 20px;">
        <h4 style="color: #1f2937; margin-bottom: 8px;">Features</h4>
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
          • Export data from any section<br>
          • Filter and paginate through items<br>
          • Add new leadership items<br>
          • Update progress metrics in real-time
        </p>
      </div>
      <div style="margin-bottom: 20px;">
        <h4 style="color: #1f2937; margin-bottom: 8px;">Keyboard Shortcuts</h4>
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
          • <kbd>Ctrl/Cmd + K</kbd> - Focus search<br>
          • <kbd>Esc</kbd> - Close modals
        </p>
      </div>
      <div style="padding: 16px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #1e3a8a;">
        <h4 style="color: #1f2937; margin-bottom: 8px;">📞 Contact Support</h4>
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
          Email: support@presiconnect.gov.za<br>
          Phone: +27 12 345 6789<br>
          Hours: Mon-Fri, 8:00 AM - 5:00 PM SAST
        </p>
      </div>
    </div>
  `;
  
  // Show in modal
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modalTitle');
  const modalForm = document.getElementById('modalForm');
  
  if (modal && modalTitle && modalForm) {
    modalTitle.innerHTML = 'Help Center';
    modalForm.style.display = 'none';
    modalForm.insertAdjacentHTML('afterend', `<div id="helpContentDiv">${helpContent}</div>`);
    modal.style.display = 'block';
  }
}

function showProfile(event) {
  if (event) event.preventDefault();
  
  // Update header nav active state
  updateHeaderNavActive('profileLink');
  
  // Create profile modal
  const profileContent = `
    <div class="profile-content">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, #1e3a8a, #3b82f6); margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 40px; color: white; font-weight: bold;">
          A
        </div>
        <h3 style="color: #1e3a8a; margin-bottom: 4px;">Administrator</h3>
        <p style="color: #6b7280; font-size: 14px;">admin@presiconnect.gov.za</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h4 style="color: #1f2937; margin-bottom: 12px; font-size: 16px;">Account Information</h4>
        <div style="background: #f9fafb; padding: 16px; border-radius: 8px; font-size: 14px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #6b7280;">Role:</span>
            <span style="color: #1f2937; font-weight: 500;">System Administrator</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #6b7280;">Department:</span>
            <span style="color: #1f2937; font-weight: 500;">The Presidency</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #6b7280;">Last Login:</span>
            <span style="color: #1f2937; font-weight: 500;">Today, 09:23 AM</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #6b7280;">Account Status:</span>
            <span style="color: #10b981; font-weight: 500;">✓ Active</span>
          </div>
        </div>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h4 style="color: #1f2937; margin-bottom: 12px; font-size: 16px;">Quick Settings</h4>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <button class="btn btn-secondary" style="width: 100%; justify-content: flex-start;" onclick="openAccountSettings()">
            ⚙️ Account Settings
          </button>
          <button class="btn btn-secondary" style="width: 100%; justify-content: flex-start;" onclick="openNotificationPreferences()">
            🔔 Notification Preferences
          </button>
          <button class="btn btn-secondary" style="width: 100%; justify-content: flex-start;" onclick="openSecurityPrivacy()">
            🔒 Security & Privacy
          </button>
        </div>
      </div>
      
      <div style="display: flex; gap: 12px;">
        <button class="btn btn-secondary" style="flex: 1;" onclick="closeModal()">Close</button>
        <button class="btn btn-primary" style="flex: 1;" onclick="showAlert('Logout functionality coming soon', 'warning')">🚪 Logout</button>
      </div>
    </div>
  `;
  
  // Show in modal
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modalTitle');
  const modalForm = document.getElementById('modalForm');
  
  if (modal && modalTitle && modalForm) {
    modalTitle.innerHTML = '👤 Your Profile';
    modalForm.style.display = 'none';
    modalForm.insertAdjacentHTML('afterend', `<div id="profileContentDiv">${profileContent}</div>`);
    modal.style.display = 'block';
  }
}

// Update header navigation active state
function updateHeaderNavActive(activeId) {
  const headerLinks = document.querySelectorAll('.header-nav a');
  headerLinks.forEach(link => link.classList.remove('active'));
  
  const activeLink = document.getElementById(activeId);
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

// Account Settings Function
function openAccountSettings() {
  closeModal();
  
  const accountSettingsContent = `
    <div class="settings-content">
      <h3 style="color: #1e3a8a; margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 24px;">⚙️</span>
        Account Settings
      </h3>
      
      <form onsubmit="saveAccountSettings(event)" style="display: flex; flex-direction: column; gap: 20px;">
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #1f2937;">Full Name</label>
          <input type="text" id="settingsName" value="Administrator" style="width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px;">
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #1f2937;">Email Address</label>
          <input type="email" id="settingsEmail" value="admin@presiconnect.gov.za" style="width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px;">
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #1f2937;">Department</label>
          <select id="settingsDepartment" style="width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px;">
            <option value="presidency" selected>The Presidency</option>
            <option value="executive">Executive Support</option>
            <option value="comms">Government Communications</option>
            <option value="oversight">Oversight & Monitoring</option>
            <option value="data">Data & Analytics</option>
          </select>
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #1f2937;">Job Title</label>
          <input type="text" id="settingsTitle" value="System Administrator" style="width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px;">
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #1f2937;">Phone Number</label>
          <input type="tel" id="settingsPhone" value="+27 12 345 6789" style="width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px;">
        </div>
        
        <div style="padding: 16px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #3b82f6;">
          <h4 style="color: #1f2937; margin-bottom: 8px; font-size: 14px; font-weight: 600;">Display Preferences</h4>
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
            <input type="checkbox" id="settingsDarkMode" style="width: 18px; height: 18px; cursor: pointer;">
            <label for="settingsDarkMode" style="color: #6b7280; font-size: 14px; margin: 0; cursor: pointer;">Enable Dark Mode</label>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <input type="checkbox" id="settingsCompact" style="width: 18px; height: 18px; cursor: pointer;">
            <label for="settingsCompact" style="color: #6b7280; font-size: 14px; margin: 0; cursor: pointer;">Compact View</label>
          </div>
        </div>
        
        <div style="display: flex; gap: 12px; margin-top: 8px;">
          <button type="button" class="btn btn-secondary" style="flex: 1;" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary" style="flex: 1;">💾 Save Changes</button>
        </div>
      </form>
    </div>
  `;
  
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modalTitle');
  const modalForm = document.getElementById('modalForm');
  
  if (modal && modalTitle && modalForm) {
    modalTitle.innerHTML = 'Account Settings';
    modalForm.style.display = 'none';
    modalForm.insertAdjacentHTML('afterend', `<div id="settingsContentDiv">${accountSettingsContent}</div>`);
    modal.style.display = 'block';
  }
}

// Save Account Settings
function saveAccountSettings(event) {
  event.preventDefault();
  
  const name = document.getElementById('settingsName').value;
  const email = document.getElementById('settingsEmail').value;
  const darkMode = document.getElementById('settingsDarkMode').checked;
  
  showAlert(`Account settings saved for ${name}`, 'success');
  closeModal();
  
  // Apply dark mode if checked
  if (darkMode) {
    showAlert('Dark mode will be available in the next update', 'warning');
  }
}

// Notification Preferences Function
function openNotificationPreferences() {
  closeModal();
  
  const notificationContent = `
    <div class="settings-content">
      <h3 style="color: #1e3a8a; margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 24px;">🔔</span>
        Notification Preferences
      </h3>
      
      <form onsubmit="saveNotificationPreferences(event)" style="display: flex; flex-direction: column; gap: 20px;">
        <div style="padding: 16px; background: #f9fafb; border-radius: 8px;">
          <h4 style="color: #1f2937; margin-bottom: 12px; font-size: 14px; font-weight: 600;">Email Notifications</h4>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <input type="checkbox" id="notifLeadership" checked style="width: 18px; height: 18px; cursor: pointer;">
              <label for="notifLeadership" style="color: #6b7280; font-size: 14px; margin: 0; cursor: pointer;">Leadership & Stakeholder updates</label>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <input type="checkbox" id="notifVulindlela" checked style="width: 18px; height: 18px; cursor: pointer;">
              <label for="notifVulindlela" style="color: #6b7280; font-size: 14px; margin: 0; cursor: pointer;">Operation Vulindlela progress</label>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <input type="checkbox" id="notifLegislation" checked style="width: 18px; height: 18px; cursor: pointer;">
              <label for="notifLegislation" style="color: #6b7280; font-size: 14px; margin: 0; cursor: pointer;">Portfolio Legislation changes</label>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <input type="checkbox" id="notifFeedback" style="width: 18px; height: 18px; cursor: pointer;">
              <label for="notifFeedback" style="color: #6b7280; font-size: 14px; margin: 0; cursor: pointer;">Citizen Feedback reports</label>
            </div>
          </div>
        </div>
        
        <div style="padding: 16px; background: #f9fafb; border-radius: 8px;">
          <h4 style="color: #1f2937; margin-bottom: 12px; font-size: 14px; font-weight: 600;">Push Notifications</h4>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <input type="checkbox" id="pushUrgent" checked style="width: 18px; height: 18px; cursor: pointer;">
              <label for="pushUrgent" style="color: #6b7280; font-size: 14px; margin: 0; cursor: pointer;">Urgent alerts only</label>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <input type="checkbox" id="pushAll" style="width: 18px; height: 18px; cursor: pointer;">
              <label for="pushAll" style="color: #6b7280; font-size: 14px; margin: 0; cursor: pointer;">All notifications</label>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <input type="checkbox" id="pushSound" checked style="width: 18px; height: 18px; cursor: pointer;">
              <label for="pushSound" style="color: #6b7280; font-size: 14px; margin: 0; cursor: pointer;">Enable notification sounds</label>
            </div>
          </div>
        </div>
        
        <div style="padding: 16px; background: #f9fafb; border-radius: 8px;">
          <h4 style="color: #1f2937; margin-bottom: 12px; font-size: 14px; font-weight: 600;">Notification Frequency</h4>
          <select id="notifFrequency" style="width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px;">
            <option value="realtime" selected>Real-time</option>
            <option value="hourly">Hourly digest</option>
            <option value="daily">Daily digest</option>
            <option value="weekly">Weekly summary</option>
          </select>
        </div>
        
        <div style="padding: 16px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
          <p style="color: #92400e; font-size: 13px; margin: 0; line-height: 1.5;">
            ⚠️ <strong>Note:</strong> Critical security alerts will always be sent regardless of your preferences.
          </p>
        </div>
        
        <div style="display: flex; gap: 12px; margin-top: 8px;">
          <button type="button" class="btn btn-secondary" style="flex: 1;" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary" style="flex: 1;">💾 Save Preferences</button>
        </div>
      </form>
    </div>
  `;
  
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modalTitle');
  const modalForm = document.getElementById('modalForm');
  
  if (modal && modalTitle && modalForm) {
    modalTitle.innerHTML = 'Notification Preferences';
    modalForm.style.display = 'none';
    modalForm.insertAdjacentHTML('afterend', `<div id="notificationContentDiv">${notificationContent}</div>`);
    modal.style.display = 'block';
  }
}

// Save Notification Preferences
function saveNotificationPreferences(event) {
  event.preventDefault();
  
  const frequency = document.getElementById('notifFrequency').value;
  const urgentOnly = document.getElementById('pushUrgent').checked;
  
  showAlert(`Notification preferences saved. Frequency: ${frequency}`, 'success');
  closeModal();
}

// Security & Privacy Function
function openSecurityPrivacy() {
  closeModal();
  
  const securityContent = `
    <div class="settings-content">
      <h3 style="color: #1e3a8a; margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 24px;">🔒</span>
        Security & Privacy
      </h3>
      
      <form onsubmit="saveSecuritySettings(event)" style="display: flex; flex-direction: column; gap: 20px;">
        <div style="padding: 16px; background: #f9fafb; border-radius: 8px;">
          <h4 style="color: #1f2937; margin-bottom: 12px; font-size: 14px; font-weight: 600;">Password</h4>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div>
              <label style="display: block; margin-bottom: 6px; font-size: 13px; color: #6b7280;">Current Password</label>
              <input type="password" id="secCurrentPass" placeholder="Enter current password" style="width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px;">
            </div>
            <div>
              <label style="display: block; margin-bottom: 6px; font-size: 13px; color: #6b7280;">New Password</label>
              <input type="password" id="secNewPass" placeholder="Enter new password" style="width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px;">
            </div>
            <div>
              <label style="display: block; margin-bottom: 6px; font-size: 13px; color: #6b7280;">Confirm New Password</label>
              <input type="password" id="secConfirmPass" placeholder="Confirm new password" style="width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 14px;">
            </div>
            <button type="button" class="btn btn-secondary" style="width: 100%; font-size: 13px;" onclick="changePassword()">🔑 Change Password</button>
          </div>
        </div>
        
        <div style="padding: 16px; background: #f9fafb; border-radius: 8px;">
          <h4 style="color: #1f2937; margin-bottom: 12px; font-size: 14px; font-weight: 600;">Two-Factor Authentication</h4>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <div>
              <p style="color: #1f2937; font-size: 14px; font-weight: 500; margin: 0;">2FA Status</p>
              <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0 0;">Add an extra layer of security</p>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #ef4444; font-size: 12px; font-weight: 500;">Disabled</span>
              <button type="button" class="btn btn-primary" style="padding: 6px 12px; font-size: 13px;" onclick="enable2FA()">Enable</button>
            </div>
          </div>
        </div>
        
        <div style="padding: 16px; background: #f9fafb; border-radius: 8px;">
          <h4 style="color: #1f2937; margin-bottom: 12px; font-size: 14px; font-weight: 600;">Privacy Settings</h4>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <input type="checkbox" id="privacyProfile" checked style="width: 18px; height: 18px; cursor: pointer;">
              <label for="privacyProfile" style="color: #6b7280; font-size: 14px; margin: 0; cursor: pointer;">Show my profile to other users</label>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <input type="checkbox" id="privacyActivity" checked style="width: 18px; height: 18px; cursor: pointer;">
              <label for="privacyActivity" style="color: #6b7280; font-size: 14px; margin: 0; cursor: pointer;">Share activity status</label>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <input type="checkbox" id="privacyAnalytics" style="width: 18px; height: 18px; cursor: pointer;">
              <label for="privacyAnalytics" style="color: #6b7280; font-size: 14px; margin: 0; cursor: pointer;">Share usage analytics</label>
            </div>
          </div>
        </div>
        
        <div style="padding: 16px; background: #f9fafb; border-radius: 8px;">
          <h4 style="color: #1f2937; margin-bottom: 12px; font-size: 14px; font-weight: 600;">Session Management</h4>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <p style="color: #1f2937; font-size: 13px; margin: 0;">Active Sessions</p>
                <p style="color: #6b7280; font-size: 12px; margin: 4px 0 0 0;">2 devices currently logged in</p>
              </div>
              <button type="button" class="btn btn-secondary" style="padding: 6px 12px; font-size: 13px;" onclick="viewActiveSessions()">View All</button>
            </div>
            <button type="button" class="btn btn-secondary" style="width: 100%; font-size: 13px; color: #ef4444; border-color: #ef4444;" onclick="logoutAllDevices()">🚪 Logout All Devices</button>
          </div>
        </div>
        
        <div style="padding: 16px; background: #fee2e2; border-radius: 8px; border-left: 4px solid #ef4444;">
          <p style="color: #991b1b; font-size: 13px; margin: 0; line-height: 1.5;">
            🛡️ <strong>Security Tip:</strong> Use a strong, unique password and enable two-factor authentication for maximum security.
          </p>
        </div>
        
        <div style="display: flex; gap: 12px; margin-top: 8px;">
          <button type="button" class="btn btn-secondary" style="flex: 1;" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary" style="flex: 1;">💾 Save Settings</button>
        </div>
      </form>
    </div>
  `;
  
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modalTitle');
  const modalForm = document.getElementById('modalForm');
  
  if (modal && modalTitle && modalForm) {
    modalTitle.innerHTML = 'Security & Privacy';
    modalForm.style.display = 'none';
    modalForm.insertAdjacentHTML('afterend', `<div id="securityContentDiv">${securityContent}</div>`);
    modal.style.display = 'block';
  }
}

// Save Security Settings
function saveSecuritySettings(event) {
  event.preventDefault();
  showAlert('Security settings saved successfully', 'success');
  closeModal();
}

// Change Password Function
function changePassword() {
  const currentPass = document.getElementById('secCurrentPass').value;
  const newPass = document.getElementById('secNewPass').value;
  const confirmPass = document.getElementById('secConfirmPass').value;
  
  if (!currentPass || !newPass || !confirmPass) {
    showAlert('Please fill in all password fields', 'warning');
    return;
  }
  
  if (newPass !== confirmPass) {
    showAlert('New passwords do not match', 'danger');
    return;
  }
  
  if (newPass.length < 8) {
    showAlert('Password must be at least 8 characters long', 'warning');
    return;
  }
  
  showAlert('Password changed successfully', 'success');
  document.getElementById('secCurrentPass').value = '';
  document.getElementById('secNewPass').value = '';
  document.getElementById('secConfirmPass').value = '';
}

// Enable 2FA Function
function enable2FA() {
  showAlert('2FA setup will be available in the next update. You will receive an email with setup instructions.', 'success');
}

// View Active Sessions
function viewActiveSessions() {
  showAlert('Active sessions: Desktop (Current), Mobile App (Last active: 2 hours ago)', 'success');
}

// Logout All Devices
function logoutAllDevices() {
  if (confirm('Are you sure you want to logout from all devices? You will need to login again.')) {
    showAlert('Successfully logged out from all devices', 'success');
    setTimeout(() => {
      closeModal();
    }, 1500);
  }
}

function showNotifications() {
  const notificationCount = document.getElementById('notificationCount');
  alert('Notifications:\n\n1. New stakeholder meeting scheduled\n2. Operation Vulindlela update available\n3. Citizen feedback threshold reached');
  
  if (notificationCount) {
    notificationCount.textContent = '0';
    notificationCount.style.display = 'none';
  }
}

// Initialize on page load
window.addEventListener('load', () => {
  showAlert('Welcome to PresiConnect Dashboard', 'success');
  
  // Initialize pagination for sections
  initializePagination('leadership');
  
  // Update timestamp
  updateTimestamp();
});

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('modal');
  if (event.target === modal) {
    closeModal();
  }
}

// Keyboard shortcuts
document.addEventListener('keydown', (event) => {
  // Escape key to close modal
  if (event.key === 'Escape') {
    const modal = document.getElementById('modal');
    if (modal && modal.style.display === 'block') {
      closeModal();
    }
  }
  
  // Ctrl/Cmd + K for search
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault();
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.focus();
    }
  }
});

// Auto-save functionality (simulated)
let autoSaveTimer;
function triggerAutoSave() {
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    console.log('Auto-saving data...');
    // In a real application, this would save to a backend
  }, 2000);
}

// Update timestamp
function updateTimestamp() {
  const now = new Date();
  const timeString = now.toLocaleString('en-ZA', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const timestampElement = document.getElementById('lastUpdated');
  if (timestampElement) {
    timestampElement.textContent = `Last updated: ${timeString}`;
  }
}

// Update timestamp every minute
setInterval(updateTimestamp, 60000);
updateTimestamp();
