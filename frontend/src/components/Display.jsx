import { FaCrown, FaMedal } from "react-icons/fa";

const Display = () => {
  // Hardcoded top singers ranking
  const topSingers = [
    { id: 1, name: "Karan Aujla" },
    { id: 2, name: "Diljit Singh" },
    { id: 3, name: "Virat" },
    { id: 4, name: "Arjun" },
    { id: 5, name: "Arjit" }
  ];

  return (
    <div className="w-72 bg-gradient-to-b from-gray-900 to-black text-white p-5 rounded-xl shadow-xl border border-gray-800">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FaCrown className="text-yellow-400" />
          BILLBOARD
        </h1>
      </div>

      {/* Ranking List */}
      <div className="space-y-4">
        {topSingers.map((singer, index) => (
          <div 
            key={singer.id}
            className="flex items-center gap-4 p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center 
              ${index === 0 ? 'bg-yellow-500' : 
                index === 1 ? 'bg-gray-500' : 
                index === 2 ? 'bg-amber-700' : 'bg-gray-800'}`}>
              <span className="font-bold">{index + 1}</span>
            </div>
            <p className="font-medium flex-1">{singer.name}</p>
            {index < 3 && (
              <FaMedal className={
                index === 0 ? 'text-yellow-400' : 
                index === 1 ? 'text-gray-300' : 'text-amber-600'
              } />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Display;