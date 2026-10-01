function clean(value, max = 200) {
  return String(value || "").replace(/[<>]/g, "").trim().slice(0, max);
}
function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 120;
}
module.exports = { clean, isEmail };
