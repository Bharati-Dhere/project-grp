export default function PopupMessage({ type, text }) {
  return (
    <div className={`fixed top-4 right-4 px-4 py-2 rounded shadow-md text-white z-50 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
      {text}
    </div>
  );
}