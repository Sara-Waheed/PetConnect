import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useNavbar } from "./NavbarContext";
import { MapPin } from "lucide-react";
import Spinner from "./Spinner";

const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const modalContentStyle = {
  backgroundColor: "#fff",
  width: "90%",
  maxWidth: "500px",
  borderRadius: "8px",
  padding: "1.5rem",
  position: "relative",
};

const PetAdoption = () => {
  const [petType, setPetType] = useState("");
  const [pets, setPets] = useState([]); // Paginated pets
  const [filteredPets, setFilteredPets] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [petsLoading, setPetsLoading] = useState(true);

  const [matchResults, setMatchResults] = useState(null);
  const [loading, setLoading] = useState(false);

  // Advanced filter modal
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    petName: "",
    location: "",
    breed: "",
    minAge: 0,
    maxAge: 25,
    species: "",
    size: "",
  });
  const [allPets, setAllPets] = useState([]);

  const navigate = useNavigate();
  const { isLoggedIn, handleShowComponent } = useNavbar();

  // ---------------------------------------
  // PAGINATED FETCH
  // ---------------------------------------
  const fetchPetsPage = async (pageNum = 1) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/auth/get-adoption-ads?page=${pageNum}&limit=40`
      );
      if (Array.isArray(response.data.ads)) {
        if (pageNum === 1) {
          setPets(response.data.ads);
        } else {
          setPets((prev) => [...prev, ...response.data.ads]);
        }
        if (response.data.totalPages) {
          setHasMore(pageNum < response.data.totalPages);
        } else {
          setHasMore(response.data.ads.length === 40);
        }
      }
    } catch (error) {
      console.error("Error fetching pets:", error);
      setHasMore(false);
    }
  };

  // ---------------------------------------
  // FETCH ALL PETS (for advanced filtering)
  // ---------------------------------------
  const fetchAllPetsNoPagination = async () => {
    let pageNum = 1;
    let accumulatedPets = [];
    let morePages = true;
    try {
      while (morePages) {
        const response = await axios.get(
          `http://localhost:5000/auth/get-adoption-ads?page=${pageNum}&limit=60`
        );
        if (Array.isArray(response.data.ads)) {
          accumulatedPets = [...accumulatedPets, ...response.data.ads];
          if (response.data.totalPages && pageNum < response.data.totalPages) {
            pageNum++;
          } else {
            morePages = false;
          }
        } else {
          morePages = false;
        }
      }
    } catch (error) {
      console.error("Error fetching all pets:", error);
    }
    setAllPets(accumulatedPets);
    return accumulatedPets;
  };

  // ---------------------------------------
  // ON MOUNT: FETCH PAGE 1 WITH LOADING SPINNER
  // ---------------------------------------
  useEffect(() => {
    const loadInitialPets = async () => {
      setPetsLoading(true);
      await fetchPetsPage(1);
      setPetsLoading(false);
    };
    loadInitialPets();
  }, []);

  // ---------------------------------------
  // BASIC FILTER: Only by petType
  // ---------------------------------------
  useEffect(() => {
    if (petType) {
      setFilteredPets(pets.filter((p) => p.species === petType));
    } else {
      setFilteredPets(pets);
    }
  }, [petType, pets]);

  // ---------------------------------------
  // LOAD MORE
  // ---------------------------------------
  const loadMore = () => {
    const nextPage = page + 1;
    fetchPetsPage(nextPage);
    setPage(nextPage);
  };

  // ---------------------------------------
  // FIND YOUR PERFECT MATCH
  // ---------------------------------------
  const handleFindMatch = async () => {
    if (!isLoggedIn) {
      handleShowComponent("login");
      return;
    }
    setLoading(true);
    try {
      const profileRes = await axios.get(
        "http://localhost:5000/auth/check-adopter-profile",
        { withCredentials: true }
      );
      if (!profileRes.data.isProfileCompleteEnough) {
        navigate("/profile/user");
        return;
      }
      const userData = profileRes.data.user;
      const matchRes = await axios.post(
        "http://localhost:5001/recommendPets",
        { adopter_id: userData._id },
        { withCredentials: true }
      );
      const recommendations = matchRes.data.recommendations;
      const allFetchedPets = await fetchAllPetsNoPagination();
      const combinedResults = recommendations.map(([petId, score]) => {
        const foundPet = allFetchedPets.find((p) => p._id === petId);
        return { ...foundPet, compatibilityScore: score };
      });
      const sortedResults = combinedResults.sort(
        (a, b) => b.compatibilityScore - a.compatibilityScore
      );
      setMatchResults(sortedResults);
    } catch (error) {
      console.error("Error during matching:", error);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------
  // ADVANCED FILTERS
  // ---------------------------------------
  const openAdvancedFilters = () => setShowAdvancedFilters(true);
  const closeAdvancedFilters = () => setShowAdvancedFilters(false);

  const handleAdvancedSearch = async () => {
    try {
      let all = allPets;
      if (!allPets || allPets.length === 0) {
        all = await fetchAllPetsNoPagination();
      }
      const { petName, location, breed, minAge, maxAge, species, size } =
        advancedFilters;
      const advancedResults = all.filter((pet) => {
        let numericAge = parseInt(pet.age);
        if (isNaN(numericAge)) numericAge = 0;
        const matchesName =
          !petName || pet.name?.toLowerCase().includes(petName.toLowerCase());
        const matchesLocation =
          !location ||
          pet.city?.toLowerCase().includes(location.toLowerCase());
        const matchesBreed =
          !breed || pet.breed?.toLowerCase().includes(breed.toLowerCase());
        const matchesSpecies = !species || pet.species === species;
        const matchesSize = !size || pet.size === size;
        const matchesAge = numericAge >= minAge && numericAge <= maxAge;
        return (
          matchesName &&
          matchesLocation &&
          matchesBreed &&
          matchesSpecies &&
          matchesSize &&
          matchesAge
        );
      });
      setMatchResults(advancedResults);
      closeAdvancedFilters();
    } catch (error) {
      console.error("Error in advanced filter search:", error);
    }
  };

  const resetAdvancedSearch = () => {
    setAdvancedFilters({
      petName: "",
      location: "",
      breed: "",
      minAge: 0,
      maxAge: 25,
      species: "",
      size: "",
    });
    setMatchResults(null);
  };

  // ---------------------------------------
  // RENDER
  // ---------------------------------------
  return (
    <div className="max-w-full mx-10 p-4">
      {/* TOOLBAR: Pet Type, More Search Prefs, and Find Match in one line, centered, light gray */}
      <div className="bg-gray-200 py-3 mb-6 flex items-center justify-center gap-4">
        <select
          className="border p-2 rounded"
          value={petType}
          onChange={(e) => setPetType(e.target.value)}
        >
          <option value="">Choose Pet Type</option>
          <option value="Dog">Dog</option>
          <option value="Cat">Cat</option>
          <option value="Rabbit">Rabbit</option>
        </select>
        <button
          className="border p-2 rounded bg-gray-200 hover:bg-gray-300"
          onClick={openAdvancedFilters}
        >
          More Search Preferences
        </button>
        <button
          className="bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded"
          onClick={handleFindMatch}
          disabled={loading}
        >
          {loading ? "Finding your match..." : "Find Your Perfect Match"}
        </button>
        <button
                className="bg-gray-100 text-black py-2 px-4 rounded hover:font-semibold"
                onClick={resetAdvancedSearch}
              >
                Reset
              </button>
      </div>

      {/* ADVANCED FILTER MODAL */}
      {showAdvancedFilters && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <span
              className="absolute top-2 right-3 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
              onClick={closeAdvancedFilters}
            >
              ✕
            </span>
            <h2 className="text-xl font-semibold mb-4 text-teal-700">
              More Search Preferences
            </h2>
            <input
              type="text"
              placeholder="Search By Pet Name"
              className="border w-full p-2 mb-3 rounded"
              value={advancedFilters.petName}
              onChange={(e) =>
                setAdvancedFilters({
                  ...advancedFilters,
                  petName: e.target.value,
                })
              }
            />
            <input
              type="text"
              placeholder="Search Pets By Location"
              className="border w-full p-2 mb-3 rounded"
              value={advancedFilters.location}
              onChange={(e) =>
                setAdvancedFilters({
                  ...advancedFilters,
                  location: e.target.value,
                })
              }
            />
            <select
              className="border p-2 mb-3 rounded w-full"
              value={advancedFilters.species}
              onChange={(e) =>
                setAdvancedFilters({
                  ...advancedFilters,
                  species: e.target.value,
                })
              }
            >
              <option value="">Pet Type</option>
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Rabbit">Rabbit</option>
            </select>
            <input
              type="text"
              placeholder="Search By Breed"
              className="border w-full p-2 mb-3 rounded"
              value={advancedFilters.breed}
              onChange={(e) =>
                setAdvancedFilters({
                  ...advancedFilters,
                  breed: e.target.value,
                })
              }
            />
            <select
              className="border p-2 mb-3 rounded w-full"
              value={advancedFilters.size}
              onChange={(e) =>
                setAdvancedFilters({
                  ...advancedFilters,
                  size: e.target.value,
                })
              }
            >
              <option value="">Choose Pet Size</option>
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
            </select>
            <div className="my-4">
              <div className="flex justify-between text-sm mb-1 font-semibold text-orange-700">
                <span>
                  Min Age <span className="text-teal-700">{advancedFilters.minAge}</span>
                </span>
                <span>
                  Max Age <span className="text-teal-700">{advancedFilters.maxAge}</span>
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={25}
                value={advancedFilters.minAge}
                onChange={(e) =>
                  setAdvancedFilters({
                    ...advancedFilters,
                    minAge: parseInt(e.target.value),
                  })
                }
                className="w-full mb-2"
              />
              <input
                type="range"
                min={0}
                max={25}
                value={advancedFilters.maxAge}
                onChange={(e) =>
                  setAdvancedFilters({
                    ...advancedFilters,
                    maxAge: parseInt(e.target.value),
                  })
                }
                className="w-full"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="bg-lime-600 w-1/3 text-white py-2 px-4 rounded hover:bg-lime-700"
                onClick={handleAdvancedSearch}
              >
                Search
              </button>
              
            </div>
          </div>
        </div>
      )}

      {/* MATCH RESULTS OR NORMAL LISTING */}
      {matchResults ? (
        <div>
          <h2 className="text-3xl font-bold mb-4">Match Results</h2>
          {matchResults.length === 0 ? (
            <div className="col-span-full text-center py-16 space-y-4">
              <p className="text-xl text-gray-600">No pets match your search criteria.</p>
              <button
                className="bg-lime-600 hover:bg-lime-700 text-white py-2 px-4 rounded transition"
                onClick={() => {
                  setMatchResults(null);
                  resetAdvancedSearch();
                }}
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {matchResults.map((pet) => (
                <div key={pet._id} className="border rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <Link to={`/pet-listing/${pet._id}`} className="block">
                    <img
                      className="w-full h-72 object-cover"
                      src={pet.photos?.[0] || "placeholder.jpg"}
                      alt={pet.name}
                    />
                    <div className="p-4">
                      <h3 className="text-2xl font-semibold mb-2">{pet.name}</h3>
                      <p className="text-base text-gray-600 mb-1">{pet.age} old</p>
                      <p className="text-base text-orange-600 mb-1">{pet.breed}</p>
                      <p className="text-base text-gray-600 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {pet.city}
                      </p>
                      {pet.compatibilityScore !== undefined && (
                        <p className="text-base text-green-600 mt-2">
                          Compatibility Score: {(pet.compatibilityScore * 100).toFixed(2)}%
                        </p>
                      )}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : petsLoading ? (
        <div className="w-full flex justify-center items-center my-52">
          <Spinner />
        </div>
      ) : filteredPets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredPets.map((pet) => (
            <div key={pet._id} className="border rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <Link to={`/pet-listing/${pet._id}`} className="block">
                <img
                  className="w-full h-72 object-cover"
                  src={pet.photos?.[0] || "placeholder.jpg"}
                  alt={pet.name}
                />
                <div className="p-4">
                  <h3 className="text-2xl font-semibold mb-2">{pet.name}</h3>
                  <p className="text-base text-gray-600 mb-1">{pet.age} old</p>
                  <p className="text-base text-orange-600 mb-1">{pet.breed}</p>
                  <p className="text-base text-gray-600 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {pet.city}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="col-span-full text-center py-16 space-y-4">
          <p className="text-xl text-gray-600">No pets available for adoption yet.</p>
          <button
            className="bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded transition"
            onClick={() => {
              setPetType("");
              resetAdvancedSearch();
            }}
          >
            Refresh List
          </button>
        </div>
      )}

      {/* LOAD MORE BUTTON */}
      {!matchResults && hasMore && filteredPets.length > 0 && (
        <div className="flex justify-center my-6">
          <button
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
            onClick={loadMore}
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default PetAdoption;
