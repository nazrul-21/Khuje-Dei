import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useAuthStore from '../store/authStore';


function Layout() {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const { logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };


  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAF5]">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-[#61906B]">Khuje Dei</span>
              </Link>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <Link to="/" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#61906B]">Home</Link>
                <Link to="/profile" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#61906B]">Profile</Link>
                <Link to="/items" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#61906B]">Items</Link>
                <Link to="/volunteers" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#61906B]">Volunteers</Link>
                {user && (
                  <>
                    <Link to="/my-reports" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#61906B]">
                      My Reports
                    </Link>
                    <Link to="/invite" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#61906B]">
                      Invite Friends
                    </Link>
                    <Link to="/bot-chat" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#61906B]">
                      Bot Chat
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="hidden md:flex items-center">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">Welcome, {user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#61906B] rounded-md hover:bg-[#4e7357]"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex space-x-4">
                  <Link to="/login" className="px-4 py-2 text-sm font-medium text-white bg-[#61906B] rounded-md hover:bg-[#4e7357]">
                    Login
                  </Link>
                  <Link to="/register" className="px-4 py-2 text-sm font-medium text-[#61906B] border border-[#61906B] rounded-md hover:bg-gray-50">
                    Register
                  </Link>
                </div>
              )}
            </div>
            <div className="flex items-center md:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-[#61906B] hover:bg-gray-100 focus:outline-none"
                aria-expanded={isMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#61906B] hover:bg-gray-50 rounded-md">Home</Link>
              <Link to="/profile" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#61906B] hover:bg-gray-50 rounded-md">Profile</Link>
              <Link to="/items" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#61906B] hover:bg-gray-50 rounded-md">Items</Link>
              <Link to="/volunteers" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#61906B] hover:bg-gray-50 rounded-md">Volunteers</Link>
              {user && (
                <>
                  <Link to="/my-reports" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#61906B] hover:bg-gray-50 rounded-md">
                    My Reports
                  </Link>
                  <Link to="/invite" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#61906B] hover:bg-gray-50 rounded-md">
                    Invite Friends
                  </Link>
                  <Link to="/bot-chat" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#61906B] hover:bg-gray-50 rounded-md">
                    Bot Chat
                  </Link>
                </>
              )}
            </div>
            {user ? (
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center justify-between px-4">
                  <div className="text-base font-medium text-gray-800">Welcome, {user.name}</div>
                  <button
                    onClick={handleLogout}
                    className="block px-4 py-2 text-sm font-medium text-white bg-[#61906B] rounded-md hover:bg-[#4e7357]"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center px-4 space-x-3">
                  <Link to="/login" className="block px-4 py-2 text-sm font-medium text-white bg-[#61906B] rounded-md hover:bg-[#4e7357]">
                    Login
                  </Link>
                  <Link to="/register" className="block px-4 py-2 text-sm font-medium text-[#61906B] border border-[#61906B] rounded-md hover:bg-gray-50">
                    Register
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="mb-4 sm:mb-0">
              <span className="text-lg font-medium text-[#61906B]">Khuje Dei</span>
              <p className="text-sm text-gray-500 mt-1">Find what you need, when you need it.</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-[#61906B]">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-[#61906B]">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-[#61906B]">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-500 text-center">&copy; {new Date().getFullYear()} Khuje Dei. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
