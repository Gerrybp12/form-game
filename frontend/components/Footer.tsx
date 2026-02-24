export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-gray-600">
        © {new Date().getFullYear()} FormBuilder
      </div>
    </footer>
  );
}