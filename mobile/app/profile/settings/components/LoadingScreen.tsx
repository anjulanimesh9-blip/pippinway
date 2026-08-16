export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020817]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>

        <p className="mt-4 text-white text-lg">
          Loading...
        </p>
      </div>
    </div>
  );
}