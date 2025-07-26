from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from pymongo import MongoClient
from tqdm import tqdm
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:5173"}})

###############################################################################
# Helper Functions
###############################################################################
def preprocess_list_columns(df):
    """
    For any column where the first non-null value is a list,
    convert each list into a sorted, comma-separated string.
    """
    for col in df.columns:
        if df[col].dtype == object:
            non_null = df[col].dropna()
            if not non_null.empty and isinstance(non_null.iloc[0], list):
                df[col] = df[col].apply(
                    lambda x: ",".join(sorted(map(str, x))) if isinstance(x, list) else x
                )
    return df

def load_data_from_mongo():
    """
    Connect to MongoDB and load adopters and pets data.
    """
    client = MongoClient("mongodb://localhost:27017/")
    db = client["PetConnect"]
    adopters_collection = db["users"]
    pets_collection = db["adoptionads"]
    
    adopters = pd.DataFrame(list(adopters_collection.find()))
    pets = pd.DataFrame(list(pets_collection.find()))
    
    if "_id" in adopters.columns:
        adopters["_id"] = adopters["_id"].astype(str)
    if "_id" in pets.columns:
        pets["_id"] = pets["_id"].astype(str)
    
    adopters = preprocess_list_columns(adopters)
    pets = preprocess_list_columns(pets)
    
    return adopters, pets

def convert_pet_age_to_number(age_str):
    """
    Convert pet age string to a number.
    For example:
      "Under 1 year" -> 0.5
      "1 year" -> 1.0
      "2 years" -> 2.0
      "20+ years" -> 20.0 (as a minimum)
    """
    age_str = age_str.strip().lower()
    if age_str == "under 1 year":
        return 0.5
    elif "year" in age_str:
        try:
            num = age_str.split()[0].replace("+", "")
            return float(num)
        except Exception as e:
            print("Error converting age:", age_str, e)
            return None
    else:
        return None

def calculate_compatibility_score(adopter, pet):
    """
    Compute a compatibility score between an adopter and a pet based on rule-based matching.
    For each applicable rule, we count one point if the criterion is met.
    The final score is the fraction of criteria met.
    """
    score = 0
    total_criteria = 0

    # Rule 1: Preferred pet type vs. pet species
    if adopter.get("preferredPetType") and pet.get("species"):
        total_criteria += 1
        if str(adopter["preferredPetType"]).upper() == str(pet["species"]).upper():
            score += 1

    # Rule 2: Ideal Size Preference vs. pet size
    if adopter.get("idealSizePreference") and pet.get("size"):
        total_criteria += 1
        if str(adopter["idealSizePreference"]).upper() == str(pet["size"]).upper():
            score += 1

    # Rule 3: Space Available vs. pet size
    if adopter.get("spaceAvailable") and pet.get("size"):
        total_criteria += 1
        space = str(adopter["spaceAvailable"]).upper()
        pet_size = str(pet["size"]).upper()
        if space == "LARGE" and (pet_size in ["MEDIUM", "LARGE", "EXTRA_LARGE"]):
            score += 1
        elif space == "MEDIUM" and pet_size in ["SMALL", "MEDIUM"]:
            score += 1
        elif space == "SMALL" and pet_size == "SMALL":
            score += 1

    # Rule 4: Ideal Age Preference vs. pet age (with mapping)
    if adopter.get("idealAgePreference") and pet.get("age"):
        total_criteria += 1
        pet_age = convert_pet_age_to_number(pet["age"])
        ideal_age = adopter["idealAgePreference"].strip().lower()
        species = str(pet.get("species", "")).strip().lower()
        if pet_age is not None:
            if species in ["cat", "rabbit"]:
                if ideal_age == "baby" and pet_age < 1:
                    score += 1
                elif ideal_age == "young" and 1 <= pet_age < 3:
                    score += 1
                elif ideal_age == "adult" and 3 <= pet_age < 8:
                    score += 1
                elif ideal_age == "senior" and pet_age >= 8:
                    score += 1
            elif species == "dog":
                if ideal_age == "puppy" and pet_age < 1:
                    score += 1
                elif ideal_age == "young" and 1 <= pet_age < 3:
                    score += 1
                elif ideal_age == "adult" and 3 <= pet_age < 7:
                    score += 1
                elif ideal_age == "senior" and pet_age >= 7:
                    score += 1

    # Rule 5: Ideal Gender Preference vs. pet gender
    if adopter.get("idealGenderPreference") and pet.get("gender"):
        total_criteria += 1
        if str(adopter["idealGenderPreference"]).upper() == str(pet["gender"]).upper():
            score += 1

    # Rule 6: Housing Type vs. Household Environment
    if adopter.get("housingType") and pet.get("householdEnvironment"):
        total_criteria += 1
        if str(adopter["housingType"]).upper() == str(pet["householdEnvironment"]).upper():
            score += 1

    # Rule 7: Daily Activity Level vs. Household Activity Level
    if adopter.get("dailyActivityLevel") and pet.get("householdActivityLevel"):
        total_criteria += 1
        if str(adopter["dailyActivityLevel"]).upper() == str(pet["householdActivityLevel"]).upper():
            score += 1

    # Rule 8: Ideal Breed Preference vs. pet breed
    if adopter.get("idealBreed") and pet.get("breed"):
        total_criteria += 1
        adopter_breeds = [b.strip() for b in str(adopter["idealBreed"]).upper().split(",")]
        if str(pet["breed"]).upper() in adopter_breeds:
            score += 1

    # Rule 9: Special Needs Receptiveness vs. pet health issues
    if adopter.get("idealSpecialNeedsReceptiveness"):
        total_criteria += 1
        pet_health = str(pet.get("hasHealthIssues", "")).upper() if pet.get("hasHealthIssues") is not None else ""
        adopter_special = str(adopter["idealSpecialNeedsReceptiveness"]).upper()
        if pet_health == "YES" and adopter_special == "YES":
            score += 1
        elif pet_health == "NO":
            score += 1

    # Rule 10: Kid-Friendly: if adopter has kids, check pet characteristics
    if adopter.get("kidsAtHome") and str(adopter["kidsAtHome"]).upper() == "YES":
        total_criteria += 1
        pet_species = str(pet.get("species", "")).upper()
        characteristic_field = None
        if pet_species == "DOG":
            characteristic_field = "dogCharacteristics"
        elif pet_species == "CAT":
            characteristic_field = "catCharacteristics"
        elif pet_species == "RABBIT":
            characteristic_field = "rabbitCharacteristics"
        if characteristic_field and pet.get(characteristic_field):
            characteristics = str(pet[characteristic_field]).upper()
            if "GOOD WITH CHILDREN" in characteristics:
                score += 1

    # Rule 11: Energy Level vs. pet personality description using TF-IDF similarity
    if adopter.get("energyLevelPreference") and pet.get("personalityDescription"):
        total_criteria += 1
        adopter_energy = str(adopter["energyLevelPreference"]).strip().upper()
        expected_personality = {
            "HIGH": "energetic playful active lively",
            "MEDIUM": "friendly balanced moderate",
            "LOW": "calm quiet relaxed"
        }
        expected_text = expected_personality.get(adopter_energy, "")
        if expected_text:
            # Create a TF-IDF vectorizer and compute cosine similarity
            vectorizer = TfidfVectorizer()
            texts = [expected_text, str(pet["personalityDescription"]).strip().lower()]
            tfidf_matrix = vectorizer.fit_transform(texts)
            cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            # Threshold can be adjusted based on your data characteristics
            if cosine_sim > 0.8:
                score += 1

    # Rule 12: Maintenance Preference vs. Pet Health Attributes
    if adopter.get("highMaintenance") is not None and adopter.get("idealSpecialNeedsReceptiveness"):
        total_criteria += 1
        if adopter["highMaintenance"] == False and str(adopter["idealSpecialNeedsReceptiveness"]).upper() == "NO":
            health_ok = (
                pet.get("hasHealthIssues") is not None and str(pet.get("hasHealthIssues")).upper() == "NO" and
                pet.get("upToDateVaccinations") and str(pet.get("upToDateVaccinations")).upper() == "YES" and
                pet.get("upToDateFleaWorm") and str(pet.get("upToDateFleaWorm")).upper() == "YES" and
                pet.get("upToDateDental") and str(pet.get("upToDateDental")).upper() == "YES"
            )
            if health_ok:
                score += 1
        else:
            health_count = 0
            if pet.get("upToDateVaccinations") and str(pet.get("upToDateVaccinations")).upper() == "YES":
                health_count += 1
            if pet.get("upToDateFleaWorm") and str(pet.get("upToDateFleaWorm")).upper() == "YES":
                health_count += 1
            if pet.get("upToDateDental") and str(pet.get("upToDateDental")).upper() == "YES":
                health_count += 1
            if pet.get("hasHealthIssues") and str(pet.get("hasHealthIssues")).upper() == "NO":
                health_count += 1
            if health_count >= 2:
                score += 1

    if total_criteria == 0:
        return 0.0
    return score / total_criteria

def get_compatibility_scores_for_adopter(adopter, pets_df):
    """
    For a given adopter (as a dictionary) and a DataFrame of pets,
    filter pets by the adopter's preferred pet type (if provided) and then
    compute and return a sorted list of (pet_id, compatibility_score) tuples.
    """
    results = []
    preferred_type = adopter.get("preferredPetType")
    if preferred_type:
        pets_df = pets_df[pets_df["species"].str.upper() == str(preferred_type).upper()]
    
    for _, pet in tqdm(pets_df.iterrows(), total=len(pets_df), desc="Matching pets"):
        comp_score = calculate_compatibility_score(adopter, pet)
        results.append((pet["_id"], comp_score))
    
    results = sorted(results, key=lambda x: x[1], reverse=True)
    return results

###############################################################################
# API Endpoint
###############################################################################

@app.route('/recommendPets', methods=['POST'])
def recommend_pets():
    """
    Similar to /matchPets, returns all pet recommendations based on the adopter's compatibility scores.
    """
    try:
        data = request.get_json()
        adopter_id = data.get("adopter_id")
        if not adopter_id:
            return jsonify({"success": False, "message": "No adopter_id provided."}), 400

        adopters_df, pets_df = load_data_from_mongo()
        adopter_row = adopters_df[adopters_df["_id"] == adopter_id]
        if adopter_row.empty:
            return jsonify({"success": False, "message": "Adopter not found."}), 404

        adopter = adopter_row.iloc[0].to_dict()
        recommendations = get_compatibility_scores_for_adopter(adopter, pets_df)
        return jsonify({"success": True, "recommendations": recommendations})
    except Exception as e:
        print("Error in /recommendPets:", e)
        return jsonify({"success": False, "message": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)