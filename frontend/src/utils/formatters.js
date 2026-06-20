export const formatTime = (timestamp) => {
  if (!timestamp) return ''
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

export const formatDate = (timestamp) => {
  if (!timestamp) return ''
  return new Intl.DateTimeFormat(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(timestamp))
}

export const formatDatetime = (timestamp) => {
  if (!timestamp) return ''
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

export const truncateText = (text = '', length = 80) => {
  if (text.length <= length) return text
  return `${text.slice(0, Math.max(0, length - 3))}...`
}

export const highlightMentions = (text = '') => text.replace(/@(\w+)/g, '<mark>@$1</mark>')

export const parseMarkdown = (text = '') => text

export const formatters = {
  formatTime,
  formatDate,
  formatDatetime,
  truncateText,
  highlightMentions,
  parseMarkdown,
}

export default formatters
