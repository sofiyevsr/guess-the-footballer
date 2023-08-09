import Link from "next/link";

const Navbar = () => {
  return (
    <div className="navbar bg-base-100 relative lg:hidden">
      <div className="flex-none">
        <label htmlFor="sidebar" className="btn btn-primary btn-square">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block w-5 h-5 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </label>
      </div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <Link
          href="/"
          className="btn btn-ghost h-full normal-case text-xl text-center active:text-white sm:text-3xl"
        >
          Guess the Footballer
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
