/**
 * Account Page - Tab switching, profile form, addresses
 */
document.addEventListener('DOMContentLoaded', function () {
  const navLinks = document.querySelectorAll('.account-nav-link');
  const sections = document.querySelectorAll('.account-section');
  const profileForm = document.getElementById('profileForm');
  const addressForm = document.getElementById('addressForm');
  const addAddressBtn = document.getElementById('addAddressBtn');
  const cancelAddressBtn = document.getElementById('cancelAddressBtn');
  const addressesEmpty = document.getElementById('addressesEmpty');
  const addressesList = document.getElementById('addressesList');

  const ADDRESSES_KEY = 'mumbaa_account_addresses';
  const PROFILE_KEY = 'mumbaa_account_profile';

  function getStoredProfile() {
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  function getStoredAddresses() {
    try {
      const data = localStorage.getItem(ADDRESSES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveProfile(profile) {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  }

  function saveAddresses(addresses) {
    try {
      localStorage.setItem(ADDRESSES_KEY, JSON.stringify(addresses));
    } catch (e) {
      console.error('Failed to save addresses', e);
    }
  }

  // Tab switching
  navLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const tab = this.getAttribute('data-tab');

      navLinks.forEach(function (l) {
        l.classList.remove('active');
      });
      this.classList.add('active');

      sections.forEach(function (section) {
        section.classList.remove('active');
        if (section.id === tab + 'Section') {
          section.classList.add('active');
        }
      });

      if (tab === 'addresses') {
        renderAddresses();
      }
    });
  });

  // Load profile into form
  (function loadProfile() {
    const profile = getStoredProfile();
    const nameEl = document.getElementById('account-name');
    const emailEl = document.getElementById('account-email');
    const phoneEl = document.getElementById('account-phone');
    if (nameEl) nameEl.value = profile.name || '';
    if (emailEl) emailEl.value = profile.email || '';
    if (phoneEl) phoneEl.value = profile.phone || '';
  })();

  // Profile form submit
  if (profileForm) {
    profileForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = document.getElementById('account-name').value.trim();
      const email = document.getElementById('account-email').value.trim();
      const phone = document.getElementById('account-phone').value.trim();

      if (!email) {
        alert('Please enter your email.');
        return;
      }

      saveProfile({ name: name, email: email, phone: phone });
      alert('Profile updated successfully.');
    });
  }

  // Address form show/hide
  if (addAddressBtn) {
    addAddressBtn.addEventListener('click', function () {
      addressesEmpty.style.display = 'none';
      addressForm.style.display = 'block';
    });
  }

  if (cancelAddressBtn) {
    cancelAddressBtn.addEventListener('click', function () {
      addressForm.style.display = 'none';
      addressForm.reset();
      var addrs = getStoredAddresses();
      if (addrs.length === 0) {
        addressesEmpty.style.display = 'block';
      }
    });
  }

  function renderAddresses() {
    var addresses = getStoredAddresses();
    if (addresses.length === 0) {
      addressesList.style.display = 'none';
      if (addressesEmpty) addressesEmpty.style.display = 'block';
      if (addressForm) addressForm.style.display = 'none';
      return;
    }

    addressesEmpty.style.display = 'none';
    addressesList.style.display = 'flex';
    addressesList.innerHTML = addresses
      .map(function (addr, index) {
        var lines = [addr.line1];
        if (addr.line2) lines.push(addr.line2);
        lines.push(addr.city + ', ' + addr.state + ' ' + addr.pincode);
        return (
          '<div class="account-address-item" data-index="' +
          index +
          '">' +
          '<strong>' +
          (addr.label || 'Address') +
          '</strong>' +
          '<p style="margin:0.5rem 0 0;color:var(--color-text-muted);font-size:0.9rem;">' +
          lines.join('<br>') +
          '</p>' +
          '<div class="account-address-actions">' +
          '<button type="button" class="btn btn-sm btn-outline remove-address-btn" data-index="' +
          index +
          '">Remove</button>' +
          '</div>' +
          '</div>'
        );
      })
      .join('');

    addressesList.querySelectorAll('.remove-address-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var index = parseInt(this.getAttribute('data-index'), 10);
        var addresses = getStoredAddresses();
        addresses.splice(index, 1);
        saveAddresses(addresses);
        renderAddresses();
      });
    });
  }

  if (addressForm) {
    addressForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var label = document.getElementById('address-label').value.trim() || 'Home';
      var line1 = document.getElementById('address-line1').value.trim();
      var line2 = document.getElementById('address-line2').value.trim();
      var city = document.getElementById('address-city').value.trim();
      var state = document.getElementById('address-state').value.trim();
      var pincode = document.getElementById('address-pincode').value.trim();

      if (!line1 || !city || !state || !pincode) {
        alert('Please fill in required address fields.');
        return;
      }

      var addresses = getStoredAddresses();
      addresses.push({
        label: label,
        line1: line1,
        line2: line2,
        city: city,
        state: state,
        pincode: pincode
      });
      saveAddresses(addresses);
      addressForm.reset();
      addressForm.style.display = 'none';
      renderAddresses();
      if (addressesEmpty) addressesEmpty.style.display = 'none';
      addressesList.style.display = 'flex';
      alert('Address saved.');
    });
  }

  renderAddresses();
});
