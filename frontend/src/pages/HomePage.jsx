import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="bg-[#61906B] text-white">
      {/* Hero Section */}
      <div className="relative py-16 sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Find What You Have Lost!
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl">
              Khuje Dei helps you find lost items and connect with people who found something.
            </p>
            <div className="mt-10 flex justify-center">
              <Link
                to="/report-lost"
                className="mx-2 px-6 py-3 border border-transparent text-base font-medium rounded-md text-[#61906B] bg-white hover:bg-gray-100 md:text-lg"
              >
                Report Lost Item
              </Link>
              <Link
                to="/report-found"
                className="mx-2 px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-[#4e7357] md:text-lg"
              >
                Report Found Item
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              How Khuje Dei Works
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Simple steps to help you find your lost items or report found ones.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-[#61906B] text-white text-2xl font-bold mx-auto">
                  1
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">Report</h3>
                <p className="mt-2 text-base text-gray-500">
                  Report your lost item or something you've found with detailed information.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-[#61906B] text-white text-2xl font-bold mx-auto">
                  2
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">Match</h3>
                <p className="mt-2 text-base text-gray-500">
                  Our system will try to match lost and found items based on descriptions.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-[#61906B] text-white text-2xl font-bold mx-auto">
                  3
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">Connect</h3>
                <p className="mt-2 text-base text-gray-500">
                  Get connected with the finder/owner and arrange to retrieve your item.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Items Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Recently Reported Items
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl">
              Browse through recently reported lost and found items.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Sample item cards - in a real app, these would be dynamically generated */}
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Lost
                  </span>
                  <h3 className="mt-2 text-xl font-semibold text-gray-900">Sample Lost Item {item}</h3>
                  <p className="mt-2 text-gray-600">Location: Sample Location</p>
                  <p className="text-gray-600">Date: {new Date().toLocaleDateString()}</p>
                  <div className="mt-4">
                    <Link
                      to={`/items/${item}`}
                      className="text-[#61906B] font-medium hover:text-[#4e7357]"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              to="/browse"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#4e7357] hover:bg-[#3d5c46]"
            >
              Browse All Items
            </Link>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Success Stories
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              See how Khuje Dei has helped people reunite with their lost items.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <p className="text-gray-600 italic">"I lost my wallet during a bus ride and thought I'd never see it again. Thanks to Khuje Dei, someone found it and contacted me within 24 hours!"</p>
              <p className="mt-4 font-medium text-gray-900">- Rahul M.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <p className="text-gray-600 italic">"Found a phone at the park and wasn't sure what to do. Posted it on Khuje Dei and was able to return it to the rightful owner. Great platform!"</p>
              <p className="mt-4 font-medium text-gray-900">- Priya S.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <p className="text-gray-600 italic">"My daughter lost her favorite teddy bear at the mall. Someone found it and posted it here. The smile on her face when she got it back was priceless!"</p>
              <p className="mt-4 font-medium text-gray-900">- Ahmed K.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#4e7357] rounded-lg shadow-xl overflow-hidden">
            <div className="px-6 py-12 sm:px-12 lg:py-16 lg:px-16">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl font-extrabold sm:text-4xl">
                  Ready to find what you're looking for?
                </h2>
                <p className="mt-4 text-lg">
                  Join thousands of users who have successfully found their lost items or helped others find theirs.
                </p>
                <div className="mt-8 flex justify-center">
                  <div className="inline-flex rounded-md shadow">
                    <Link
                      to="/register"
                      className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-[#61906B] bg-white hover:bg-gray-50"
                    >
                      Sign Up Now
                    </Link>
                  </div>
                  <div className="ml-3 inline-flex">
                    <Link
                      to="/browse"
                      className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#3d5c46] hover:bg-[#2d4535]"
                    >
                      Browse Items
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
}

export default HomePage;
