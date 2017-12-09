module.exports = {
  user_agent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  accept: 'text/html,application/xhtml+xml,' + 'application/xml;q=0.9,*/*;q=0.8',
  compressed: true,
  concurrency: 1,
  decode_response: true,
  follow: 3,
  follow_set_cookies: true,
  follow_set_referer: true,
  keep_data: false,
  parse_cookies: true, // Parse "Set-Cookie" header
  parse_response: false,
  rejectUnauthorized: false,
  statsThreshold: 25,
  timeout: 30 * 1000,
  tries: 3
}
