function ok(data = {}) {
  return { success: true, data };
}

function fail(message, code = 'BAD_REQUEST', details = null) {
  return { success: false, error: { code, message, details } };
}

module.exports = {
  ok,
  fail
};
