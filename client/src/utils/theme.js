export const t = (theme) => ({
  // Backgrounds
  bg: theme === 'light' ? '#F9F9F7' : '#0F0F0F',
  bgCard: theme === 'light' ? '#FFFFFF' : '#161616',
  bgCardAlt: theme === 'light' ? '#F2F2F0' : '#1C1C1C',
  bgInput: theme === 'light' ? '#F2F2F0' : '#FEFEFE08',
  bgHover: theme === 'light' ? '#E8E8E6' : '#FEFEFE08',

  // Text
  textPrimary: theme === 'light' ? '#0F0F0F' : '#FEFEFE',
  textSecondary: theme === 'light' ? '#0F0F0F99' : '#FEFEFE66',
  textMuted: theme === 'light' ? '#0F0F0F55' : '#FEFEFE44',
  textFaint: theme === 'light' ? '#0F0F0F33' : '#FEFEFE22',

  // Borders
  border: theme === 'light' ? '#0F0F0F15' : '#FEFEFE11',
  borderMid: theme === 'light' ? '#0F0F0F22' : '#FEFEFE22',
  borderStrong: theme === 'light' ? '#0F0F0F33' : '#FEFEFE33',

  // Accent (cyan)
  accent: theme === 'light' ? '#0AA8C7' : '#6CE9FE',
  accentBg: theme === 'light' ? '#0AA8C715' : '#6CE9FE15',
  accentBorder: theme === 'light' ? '#0AA8C730' : '#6CE9FE30',
  accentText: theme === 'light' ? '#0AA8C7' : '#6CE9FE',

  // Status
  successBg: theme === 'light' ? '#0AA8C715' : '#6CE9FE22',
  successText: theme === 'light' ? '#0AA8C7' : '#6CE9FE',
  successBorder: theme === 'light' ? '#0AA8C730' : '#6CE9FE44',
  errorBg: theme === 'light' ? '#FF000011' : '#FF000011',
  errorText: theme === 'light' ? '#CC3333' : '#FF6B6B',
  errorBorder: theme === 'light' ? '#CC333333' : '#FF000033',
  deleteBg: theme === 'light' ? '#FF000011' : '#FF6B6B22',
  deleteText: theme === 'light' ? '#CC3333' : '#FF6B6B',
  deleteBorder: theme === 'light' ? '#CC333333' : '#FF6B6B44',

  // Navbar
  navBg: theme === 'light' ? '#FFFFFF' : '#0F0F0F',
  navBorder: theme === 'light' ? '#0F0F0F10' : '#FEFEFE11',
});