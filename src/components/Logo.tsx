export default function Logo() {
    return (
        <div className="relative w-20 h-20 rounded-full border-4 border-yellow-500 shadow-xl overflow-hidden flex flex-col items-center justify-center bg-white">
            {/* الأعلام */}
            <div className="absolute top-0 left-0 w-full h-[33.33%] bg-blue-600"></div>
            <div className="absolute top-[33.33%] left-0 w-full h-[33.33%] bg-green-600"></div>
            <div className="absolute bottom-0 left-0 w-full h-[33.33%] bg-yellow-400"></div>

            {/* الرمز */}
            <div className="relative z-10 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-[#71580b]">ⵣ</span>
                <span className="text-xs font-bold text-[#71580b]">L-O</span>
            </div>
        </div>
    );
}