function clean(value, max = 200) {
  return String(value || "")
    .replace(/[<>]/g, "")
    .replace(/[\u0000-\u001F]/g, "")
    .trim()
    .slice(0, max);
}

function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 120;
}

function strongPassword(password) {
  const value = String(password || "");
  if (value.length < 10 || value.length > 72) return false;
  return /[A-Za-z]/.test(value) && /\d/.test(value);
}

module.exports = { clean, isEmail, strongPassword };
