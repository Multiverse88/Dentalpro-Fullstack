interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
}

export function SearchInput({ className, ...props }: SearchInputProps) {
  return (
    <div className="relative w-full max-w-md group">
      <div className="relative">
        <input
          type="search"
          className={`w-full h-12 rounded-xl border border-gray-200 bg-white shadow-sm px-12 py-3 text-base placeholder:text-gray-400 
          transition-all duration-200 ease-in-out
          hover:border-blue-300 hover:shadow-md
          focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:shadow-lg
          ${className}`}
          {...props}
        />
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <svg
            className="h-5 w-5 text-gray-400 transition-colors duration-200 group-hover:text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
      <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-blue-50 via-blue-25 to-gray-50 opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-50" />
    </div>
  );
}
