// Logout and auto-switch to another account if present
export const logoutAndSwitch = () => {
  const loggedIn = JSON.parse(localStorage.getItem("loggedInUser"));
  let addedAccounts = JSON.parse(localStorage.getItem("addedAccounts")) || [];
  // Remove current user from addedAccounts
  const filtered = loggedIn ? addedAccounts.filter(e => e !== loggedIn.email) : addedAccounts;
  localStorage.setItem("addedAccounts", JSON.stringify(filtered));
  // Remove loggedInUser
  localStorage.removeItem("loggedInUser");
  // Switch to another account if present
  if (filtered.length > 0) {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const nextUser = users.find(u => u.email === filtered[0]);
    if (nextUser) {
      localStorage.setItem("loggedInUser", JSON.stringify(nextUser));
      return nextUser;
    }
  }
  return null;
};
export const getUsers = () => {
  return JSON.parse(localStorage.getItem("users")) || [];
};

export const getLoggedInUser = () => {
  try {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    return user || null;
  } catch {
    return null;
  }
};

export const setLoggedInUser = (user) => {
  localStorage.setItem("loggedInUser", JSON.stringify(user));
};

export const logoutUser = () => {
  localStorage.removeItem("loggedInUser");
};

export const deleteAccount = (email) => {
  const users = getUsers().filter((user) => user.email !== email);
  localStorage.setItem("users", JSON.stringify(users));
  logoutUser();
};