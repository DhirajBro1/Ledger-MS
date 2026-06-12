module.exports = (_req, res) => {
  res.status(200).json({ ok: true, message: "Ledger-MS API is running" });
};
