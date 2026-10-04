// Reporting aliases only; original answers, lender mentions and citation URLs remain unchanged.
const lenderAliases: Record<string,string> = {
  bajajfinance: "Bajaj Finance / Bajaj Finserv", bajajfinancelimited: "Bajaj Finance / Bajaj Finserv",
  bajajfinserv: "Bajaj Finance / Bajaj Finserv", bajajfinservlimited: "Bajaj Finance / Bajaj Finserv",
  icici: "ICICI Bank", icicibank: "ICICI Bank", icicibanklimited: "ICICI Bank",
  hdfcbank: "HDFC Bank", hdfcbanklimited: "HDFC Bank",
  sbi: "State Bank of India", statebankofindia: "State Bank of India",
  tatacapital: "Tata Capital", tatacapitallimited: "Tata Capital",
};
const siteAliases: Record<string,string> = {
  "bajajfinserv.in": "bajajfinserv.in", "bajajfinance.com": "bajajfinserv.in", "bajajfinance.in": "bajajfinserv.in",
  "icici.bank.in": "icici.bank.in / icicibank.com", "icicibank.com": "icici.bank.in / icicibank.com",
  "hdfc.bank.in": "hdfc.bank.in / hdfcbank.com", "hdfcbank.com": "hdfc.bank.in / hdfcbank.com",
  "axis.bank.in": "axis.bank.in / axisbank.com", "axisbank.com": "axis.bank.in / axisbank.com",
  "bank.sbi": "bank.sbi / sbi.bank.in / sbi.co.in", "sbi.bank.in": "bank.sbi / sbi.bank.in / sbi.co.in", "sbi.co.in": "bank.sbi / sbi.bank.in / sbi.co.in",
  "rbi.org.in": "rbi.org.in", "tatacapital.com": "tatacapital.com", "kreditbee.in": "kreditbee.in",
};
export function lenderIdentity(name: string) {
  return lenderAliases[name.toLowerCase().replace(/[^a-z0-9]/g, "")] || name;
}
export function siteIdentity(domain: string) {
  const host = domain.toLowerCase().replace(/^www\./, "");
  for (const [suffix,identity] of Object.entries(siteAliases)) if (host === suffix || host.endsWith(`.${suffix}`)) return identity;
  return host;
}
