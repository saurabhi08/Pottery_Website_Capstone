/**
 * Auth helpers - current user, sign out, role (used by checkout, account, admin, auth-state)
 * Load after firebase-config.js (auth, db).
 */
function getCurrentUser() {
  if (typeof auth !== 'undefined' && auth) {
    return auth.currentUser || null;
  }
  return null;
}

function signOut() {
  if (typeof auth !== 'undefined' && auth) {
    try {
      localStorage.removeItem('mumbaa_account_profile');
    } catch (e) {}
    return auth.signOut().then(function () {
      window.location.href = 'index.html';
    }).catch(function () {
      window.location.href = 'index.html';
    });
  }
  window.location.href = 'index.html';
}

function getUserRole(callback) {
  var user = getCurrentUser();
  if (!user || typeof db === 'undefined' || !db) {
    if (callback) callback('customer');
    return;
  }
  db.collection('users').doc(user.uid).get()
    .then(function (doc) {
      var role = (doc.exists && doc.data() && doc.data().role) ? doc.data().role : 'customer';
      if (callback) callback(role);
    })
    .catch(function () {
      if (callback) callback('customer');
    });
}
