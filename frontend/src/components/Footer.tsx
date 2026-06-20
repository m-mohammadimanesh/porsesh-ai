export default function Footer() {
  return (
    <footer className="w-full py-2 text-center text-xs text-slate-500 dark:text-slate-400 bg-transparent shrink-0">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-4">
        <span>© 2026 Mohammad Mohammadi Manesh | محمد محمدی منش</span>
        <a 
          href="https://github.com/m-mohammadimanesh/porsesh-ai" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors font-medium underline underline-offset-2"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}
