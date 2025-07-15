// utils/mentionUtils.js
function extractMentions(htmlContent) {
  const regex = /@([\w\d_]+)/g;
  const matches = [];
  let match;
  while ((match = regex.exec(htmlContent)) !== null) {
    matches.push(match[1]); // just the username
  }
  return [...new Set(matches)]; // remove duplicates
}

module.exports = { extractMentions };
