import { useTheme } from '../context/ThemeContext';

export default function StatusBadge({ status }) {
  const { theme } = useTheme();

  const styles = {
    completed: {
      backgroundColor: theme === 'light' ? '#0AA8C715' : '#6CE9FE22',
      color: theme === 'light' ? '#0AA8C7' : '#6CE9FE',
      border: `1px solid ${theme === 'light' ? '#0AA8C730' : '#6CE9FE44'}`,
    },
    pending: {
      backgroundColor: theme === 'light' ? '#F59E0B15' : '#FAC77522',
      color: theme === 'light' ? '#B45309' : '#FAC775',
      border: `1px solid ${theme === 'light' ? '#F59E0B30' : '#FAC77544'}`,
    },
    rejected: {
      backgroundColor: theme === 'light' ? '#CC333315' : '#FF6B6B22',
      color: theme === 'light' ? '#CC3333' : '#FF6B6B',
      border: `1px solid ${theme === 'light' ? '#CC333330' : '#FF6B6B44'}`,
    },
  };

  return (
    <span
      className="text-xs font-medium px-2.5 py-1 rounded-full"
      style={styles[status] || {
        backgroundColor: theme === 'light' ? '#0F0F0F11' : '#FEFEFE11',
        color: theme === 'light' ? '#0F0F0F66' : '#FEFEFE66',
      }}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}