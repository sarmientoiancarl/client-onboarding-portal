export default function StatusBadge({ status }) {
  const styles = {
    completed: { backgroundColor: '#6CE9FE22', color: '#6CE9FE', border: '1px solid #6CE9FE44' },
    pending: { backgroundColor: '#FAC77522', color: '#FAC775', border: '1px solid #FAC77544' },
    rejected: { backgroundColor: '#FF6B6B22', color: '#FF6B6B', border: '1px solid #FF6B6B44' },
  };

  return (
    <span
      className="text-xs font-medium px-2.5 py-1 rounded-full"
      style={styles[status] || { backgroundColor: '#FEFEFE11', color: '#FEFEFE66' }}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}