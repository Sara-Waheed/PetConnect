import React from "react";
import { useNavigate } from "react-router-dom";
import PetsIcon from "@mui/icons-material/Pets";

const EmotionFeatureCard = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/predict-emotion");
  };

  return (
    <div className="w-full mx-auto lg:max-w-6xl custom-lg:max-w-4xl max-w-xs custom-xs:max-w-md sm:max-w-xl md:max-w-2xl 
      mb-10 flex flex-col md:flex-row items-center md:items-start justify-center gap-4 bg-gradient-to-r from-teal-50 to-teal-200 py-10 px-4 rounded-2xl shadow-lg"
    >
        {/* Icon */}
        <div className="flex-shrink-0 text-6xl hidden md:block text-orange-400 mr-6">
          <PetsIcon fontSize="inherit" />
        </div>

        {/* Text & CTA */}
        <div className="flex-grow">
          <h2 className="text-3xl md:text-4xl font-extrabold text-teal-800 mb-3">
            Pet Emotion Predictor 🐾
          </h2>
          <p className="text-gray-700 text-base md:text-lg mb-6">
            Snap a pic of your furry friend and find out how they’re feeling — it’s fun, fast, and fur-tastic!
          </p>
         <div className="flex justify-center"> {/* Added container div for centering */}
            <button
                onClick={handleClick}
                className="relative inline-flex items-center px-8 py-3 text-2xl font-extrabold rounded-[2rem]
                        bg-gradient-to-r from-green-400 to-teal-600 
                        hover:from-green-500 hover:to-teal-700
                        animate-bounce hover:animate-none
                        transition-all duration-300 hover:scale-110
                        shadow-lg hover:shadow-2xl
                        border-4 border-yellow-300 hover:border-yellow-400
                        group"
                style={{ fontFamily: "'Comic Neue', cursive" }}
            >
                <span className="absolute top-0 left-0 w-full h-full rounded-[2rem] overflow-hidden">
                <span className="absolute top-0 left-[-75%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent 
                                group-hover:left-[150%] transition-all duration-1000" />
                </span>
                
                <span className="relative z-10">
                <span className="inline-block animate-wiggle group-hover:animate-spin">🐾</span>
                <span className="mx-4 text-transparent bg-clip-text text-white">
                    Sniff Out Emotions!
                </span>
                <span className="inline-block animate-wiggle group-hover:animate-spin">❤️</span>
                </span>
            </button>
        </div>

        <style>{`
        @keyframes wiggle {
            0%, 100% { transform: rotate(-10deg); }
            50% { transform: rotate(10deg); }
        }
        .animate-wiggle {
            animation: wiggle 0.5s ease-in-out infinite;
        }
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        .animate-bounce {
            animation: bounce 1s infinite;
        }
        `}</style>
        </div>
    </div>
  );
};

export default EmotionFeatureCard;
