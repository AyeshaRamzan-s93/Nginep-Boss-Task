

document.addEventListener('DOMContentLoaded', () => {
  
  const API_URL = 'http://localhost:3000/users';

  // Main Sections
  const dashboardSection = document.getElementById('dashboardSection');
  const addItemSection = document.getElementById('addItemSection');
  const settingsSection = document.getElementById('settingsSection');

  // Add item form
  const addItemForm = document.getElementById('addItemForm');
  const itemNameInput = document.getElementById('itemName');
  const itemImageInput = document.getElementById('itemImage');
  const formSubmitButton = addItemForm?.querySelector('button');

  // Sidebar + Column add buttons
  const dashboardBtn = document.querySelector('.first-menu li');        // "Dashboard" in sidebar
  const addItemBtn = document.querySelector('.second-menu li');          // "Add Item" in sidebar
  const addItemButtons = document.querySelectorAll('.add-item');         // "+ Add New Task" buttons in each column

  // Navbar Search 
  const toggleSearchBtn = document.getElementById('toggleSearchDropdown');
  const searchInput = document.getElementById('taskSearchInput');
  const searchDropdown = document.getElementById('searchDropdown');
  const hasSearchUI = !!(toggleSearchBtn && searchInput && searchDropdown);

  // Settings
  const settingsForm = document.getElementById('settingsForm');
  const settingsName = document.getElementById('settingsName');
  const settingsSurname = document.getElementById('settingsSurname');
  const settingsPhone = document.getElementById('settingsPhone');
  const settingsEmail = document.getElementById('settingsEmail');
  const settingsPassword = document.getElementById('settingsPassword');
  const settingsIcon = document.querySelector('.fa-gear'); 

  // State
  let editItemId = null;                 // if set, we are editing an existing task
  let targetColumnState = 'todo';        // which column a new task will go to
  let allTasks = [];                    // always the latest tasks in memory (filtered to tasks only)
  let dropdownVisible = false;          // search dropdown visibility state

  // Settings state
  let allUsers = [];
  let selectedUserId = null;
  let nameDropdownShownOnce = false;
  let emailDropdownShownOnce = false;

  // ========== UTIL HELPERS =============

  const VALID_STATES = new Set(['todo', 'doing', 'done']);

  // Check if an object is a valid task record
  function isTask(obj) {
    return obj && typeof obj === 'object'
      && typeof obj.name === 'string'
      && VALID_STATES.has(obj.state);
  }

  // Keep only valid tasks from any fetched data
  function onlyTasks(data) {
    return Array.isArray(data) ? data.filter(isTask) : [];
  }

  // Show/hide any element safely
  function safeShow(el, show) {
    if (!el) return;
    el.style.display = show ? 'block' : 'none';
  }

  // Sidebar active state
  function setActiveSidebar(which) {
    document.querySelectorAll('.sidebar-menu li').forEach(li => li.classList.remove('active'));
    if (which === 'dashboard') dashboardBtn?.classList.add('active');
    if (which === 'add') addItemBtn?.classList.add('active');
  }

  // Disable browser native form validation popups (we use JS alerts)
  if (addItemForm) addItemForm.noValidate = true;
  itemNameInput?.removeAttribute('required');
  itemImageInput?.removeAttribute('required');

  // ================= VIEW SWITCHERS ==================

  // Show the board and refresh tasks
  function showDashboard() {
    safeShow(dashboardSection, true);
    safeShow(addItemSection, false);
    safeShow(settingsSection, false);
    fetchAndRenderTasks();                          // always refresh the board when opening
    setActiveSidebar('dashboard');
  }

  // Show "Add Item" form (pre-filled for edit)

  function showAddItem(preFill = null) {
    safeShow(dashboardSection, false);
    safeShow(addItemSection, true);
    safeShow(settingsSection, false);

    if (preFill) {
      // Editing existing task
      editItemId = preFill.id;
      targetColumnState = preFill.state || 'todo';
      itemNameInput.value = preFill.name || '';
      itemImageInput.value = preFill.image || '';
      formSubmitButton.textContent = 'Edit Item';
    } else {
      // Creating new task
      editItemId = null;
      addItemForm.reset();
      formSubmitButton.textContent = 'Add Item';
    }

    itemNameInput?.focus();
    setActiveSidebar('add');
  }

  // ================  Show Settings screen ===================

  function showSettings() {
    safeShow(dashboardSection, false);
    safeShow(addItemSection, false);
    safeShow(settingsSection, true);

    settingsForm?.reset();
    selectedUserId = null;
    setActiveSidebar(null); // remove highlight from sidebar
  }

  // ========== TOGGLING  ==========

  // Sidebar: Dashboard
  dashboardBtn?.addEventListener('click', showDashboard);

  // Sidebar: Add Item (defaults to 'todo' column for new items)
  addItemBtn?.addEventListener('click', () => {
    targetColumnState = 'todo';
    showAddItem();
  });

  // "+ Add New Task" buttons inside each column — open form pre-targeted to that column
  addItemButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const col = e.currentTarget.closest('.todo-column');
      targetColumnState = col?.dataset?.state || 'todo';
      showAddItem();
    });
  });

  // ================== SETTINGS ===================

  // Open settings on gear click
  settingsIcon?.addEventListener('click', showSettings);

  // Load users (only signup related info)
  async function fetchAllUsers() {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      allUsers = data.filter(u => u.name && u.surname && u.email);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  }

  // Build a small dropdown below an input with suggestions
  function createSuggestions(inputEl, key) {
    const dropdown = document.createElement('div');
    dropdown.className = 'settings-dropdown';
    dropdown.style.cssText = `
      position: absolute; z-index: 999; background: #fff;
      border: 1px solid #ccc; width: ${inputEl.offsetWidth}px;
      max-height: 150px; overflow-y: auto;
    `;

    allUsers.forEach(user => {
      const option = document.createElement('div');
      option.textContent = user[key];
      option.className = 'settings-dropdown-item';
      option.style.cssText = 'padding: 8px; cursor: pointer;';
      option.addEventListener('click', () => {
        dropdown.remove();
        loadUserData(user);
      });
      dropdown.appendChild(option);
    });

    // Remove any old dropdowns before adding a new one
    document.querySelectorAll('.settings-dropdown').forEach(el => el.remove());
    inputEl.parentElement.appendChild(dropdown);
  }

  // Fill settings form with a picked user's data

  function loadUserData(user) {
    selectedUserId = user.id;
    settingsName.value = user.name || '';
    settingsSurname.value = user.surname || '';
    settingsPhone.value = user.phone || '';
    settingsEmail.value = user.email || '';
    settingsPassword.value = user.password || '';
  }

  // Show suggestions when focusing (only once if field is empty)

  settingsName?.addEventListener('focus', () => {
    if (!nameDropdownShownOnce && !settingsName.value.trim()) {
      if (allUsers.length) createSuggestions(settingsName, 'name');
      nameDropdownShownOnce = true;
    }
  });

  settingsEmail?.addEventListener('focus', () => {
    if (!emailDropdownShownOnce && !settingsEmail.value.trim()) {
      if (allUsers.length) createSuggestions(settingsEmail, 'email');
      emailDropdownShownOnce = true;
    }
  });

  // ================ Save settings for the selected user ===============

  settingsForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      alert("Please select a user first from Name or Email.");
      return;
    }
    try {
      await fetch(`${API_URL}/${selectedUserId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: settingsName.value.trim(),
          surname: settingsSurname.value.trim(),
          phone: settingsPhone.value.trim(),
          email: settingsEmail.value.trim(),
          password: settingsPassword.value.trim()
        })
      });
      alert("User settings updated!");
      fetchAllUsers();
      showDashboard(); // return to board
    } catch (err) {
      console.error("Error updating settings:", err);
    }
  });

  // ===================== TASKS: FETCH & RENDER ======================

  // Get all records and keep only task-type items
  async function fetchAndRenderTasks() {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      allTasks = onlyTasks(data);
      renderTasks(allTasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  }

  // Paint tasks into their columns (newest first by id)
  function renderTasks(tasks) {
    // Clear all columns first
    document.querySelectorAll('.todo-column .tasks').forEach(c => (c.innerHTML = ''));

    // Render per state
    tasks
      .slice()
      .sort((a, b) => (b.id || 0) - (a.id || 0))
      .forEach(task => {
        const list = document.querySelector(`.todo-column[data-state="${task.state}"] .tasks`);
        if (list) list.appendChild(createTaskCard(task));
      });
  }

  // ==== Build a single task card (image, title, move checkboxes, edit/delete)

  function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card';

    // Image (optional)
    const imgBox = document.createElement('div');
    imgBox.className = 'image-placeholder';
    if (task.image && task.image.trim()) {
      const img = document.createElement('img');
      img.src = task.image;
      img.alt = task.name || '';
      img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; border-radius: 8px;';
      imgBox.appendChild(img);
    }
    card.appendChild(imgBox);

    // Title
    const title = document.createElement('h4');
    title.textContent = task.name || 'Untitled Task';
    card.appendChild(title);

    // Move checkboxes (to move task to a different column)
    const moveBox = document.createElement('div');
    moveBox.className = 'task-move';

    ['todo', 'doing', 'done'].forEach(state => {
      if (state === task.state) return; // don't show checkbox for the current state
      const label = document.createElement('label');
      label.style.cssText = 'display: flex; align-items: center; gap: 6px;';

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.addEventListener('change', () => updateTaskState(task.id, state));

      label.appendChild(input);
      label.appendChild(document.createTextNode(
        state === 'doing' ? 'In Progress' : (state === 'todo' ? 'To Do' : 'Done')
      ));
      moveBox.appendChild(label);
    });

    card.appendChild(moveBox);

    // ==================  Actions (delete / edit) ================

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const trash = document.createElement('i');
    trash.className = 'fa-solid fa-trash delete-btn';
    trash.style.color = 'red';
    trash.title = 'Delete';
    trash.addEventListener('click', () => deleteTask(task.id));

    const edit = document.createElement('i');
    edit.className = 'fa-solid fa-pen edit-btn';
    edit.title = 'Edit';
    edit.addEventListener('click', () => showAddItem(task));

    actions.append(trash, edit);
    card.appendChild(actions);

    return card;
  }

  // ========== CRUD (UPDATE / DELETE / CREATE) ==========

  // Move a task to another state
  async function updateTaskState(id, newState) {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: newState })
      });
      fetchAndRenderTasks(); // refresh board
    } catch (err) {
      console.error('Error updating state:', err);
    }
  }

  // ============ Delete a task ==================

  async function deleteTask(id) {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchAndRenderTasks();
      // If search dropdown is open with a query, refresh its results too
      if (hasSearchUI && dropdownVisible && searchInput.value.trim()) {
        runSearch(searchInput.value.trim());
      }
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  }

  // Create or update task on form submit
  addItemForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = itemNameInput?.value.trim();
    const image = itemImageInput?.value.trim() || '';

    if (!name) {
      alert('Please enter an item name.');
      itemNameInput?.focus();
      return;
    }

    try {
      if (editItemId) {
        // Update existing
        await fetch(`${API_URL}/${editItemId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, image })
        });
        editItemId = null;
      } else {
        // Create new (goes to the currently targeted column)
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, image, state: targetColumnState })
        });
      }
    } catch (err) {
      console.error('Error saving task:', err);
    }

    addItemForm.reset();
    showDashboard(); // back to board and refresh
  });


  // ===================== SEARCH ====================


  // Render the dropdown list under the search input
  function renderDropdown(matches) {
    if (!hasSearchUI) return;

    searchDropdown.innerHTML = '';
    if (!matches.length) {
      searchDropdown.innerHTML = '<div class="search-dropdown-item">No items found</div>';
      return;
    }

    matches.forEach(task => {
      const row = document.createElement('div');
      row.className = 'search-dropdown-item';
      row.innerHTML = `
        <span>${task.name}</span>
        <div class="actions">
          <i class="fa-solid fa-pen" title="Edit"></i>
          <i class="fa-solid fa-trash" title="Delete" style="color:red;"></i>
        </div>
      `;

      // Edit from dropdown
      row.querySelector('.fa-pen').addEventListener('click', () => {
        dropdownVisible = false;
        searchDropdown.style.display = 'none';
        showAddItem(task);
      });

      // Delete from dropdown
      row.querySelector('.fa-trash').addEventListener('click', async () => {
        await deleteTask(task.id);
        if (searchInput.value.trim()) runSearch(searchInput.value.trim());
      });

      searchDropdown.appendChild(row);
    });
  }

  // Compute matches and show/hide dropdown
  function runSearch(rawQuery) {
    if (!hasSearchUI) return;

    const query = rawQuery.trim().toLowerCase();
    if (!query) {
      dropdownVisible = false;
      searchDropdown.style.display = 'none';
      return;
    }

    const matches = allTasks.filter(t => t.name.toLowerCase().includes(query));
    renderDropdown(matches);
    searchDropdown.style.display = 'block';
    dropdownVisible = true;
  }

  // Hook up search UI events (typing, icon click, click-outside)
  if (hasSearchUI) {
    // Typing triggers live search
    searchInput.addEventListener('input', () => runSearch(searchInput.value));

    // Clicking the search icon toggles the dropdown
    toggleSearchBtn.addEventListener('click', () => {
      const q = searchInput.value.trim();
      if (dropdownVisible && q) {
        dropdownVisible = false;
        searchDropdown.style.display = 'none';
      } else {
        if (!q) {
          searchDropdown.innerHTML = '<div class="search-dropdown-item">Type a name to search</div>';
          searchDropdown.style.display = 'block';
          dropdownVisible = true;
        } else {
          runSearch(q);
        }
      }
      searchInput.focus();
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (!searchDropdown.contains(e.target)
          && !toggleSearchBtn.contains(e.target)
          && !searchInput.contains(e.target)) {
        dropdownVisible = false;
        searchDropdown.style.display = 'none';
      }
    });
  } else {
    console.warn('Search UI not found. Ensure #toggleSearchDropdown, #taskSearchInput, #searchDropdown exist.');
  }

  
  fetchAllUsers();                // load users for settings suggestions
  showDashboard();               // opens board and fetches tasks
});


// Sidebar toggle for mobile
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggleSidebar");
  const sidebar = document.querySelector(".sidebar");

  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("active");
  });
});
