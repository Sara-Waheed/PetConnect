import sharp from 'sharp';
import jwt from 'jsonwebtoken';
import { AdoptionAdModel } from '../models/AdoptionAd.js';
import { UserModel } from '../models/User.js';
import { AdoptionApplicationModel } from '../models/AdoptionApplication.js'
import { sendAcceptanceEmail, sendRejectionEmail } from '../middleware/Email.js';


export const SubmitAdoptionAd = async (req, res) => {
  try {
    console.log("in submitAdoptionAd");

    // Get token from cookies
    const token = req.cookies.pet_ownerToken;
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided, unauthorized" });
    }

    // Verify token and extract user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    // Find the user (ensure it's a pet owner)
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Pet owner not found" });
    }

    // Process images if provided
    let processedImages = [];
    if (req.files && req.files.photos) {
      processedImages = await Promise.all(
        req.files.photos.map(async (file) => {
          const optimizedImageBuffer = await sharp(file.buffer)
            .resize({ width: 800, height: 800, fit: 'inside' })
            .toFormat('jpeg', { quality: 80 })
            .toBuffer();

          return `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
        })
      );
    }

    const breed = Array.isArray(req.body.breed) ? req.body.breed.join(", ") : req.body.breed;
    // Create and save the adoption ad
    const newAd = new AdoptionAdModel({
      user: userId,
      species: req.body.species,
      reasonsForRehoming: req.body.reasonsForRehoming,
      keepDuration: req.body.keepDuration,
      city: req.body.city,
      householdActivityLevel: req.body.householdActivityLevel,
      otherPets: req.body.otherPets,
      householdEnvironment: req.body.householdEnvironment,
      name: req.body.name,
      age: req.body.age,
      breed: breed,
      size: req.body.size,
      gender: req.body.gender,
      spayedNeutered: req.body.spayedNeutered,
      microchipped: req.body.microchipped,
      photos: processedImages, // Store Base64 encoded images
      ownedDuration: req.body.ownedDuration,
      acquiredFrom: req.body.acquiredFrom,
      colors: req.body.colors,
      dogCharacteristics: req.body.dogCharacteristics,
      catCharacteristics: req.body.catCharacteristics,
      rabbitCharacteristics: req.body.rabbitCharacteristics,
      dogSocialIssues: req.body.dogSocialIssues,
      catSocialIssues: req.body.catSocialIssues,
      upToDateVaccinations: req.body.upToDateVaccinations,
      upToDateFleaWorm: req.body.upToDateFleaWorm,
      upToDateDental: req.body.upToDateDental,
      hasHealthIssues: req.body.hasHealthIssues,
      hasMedication: req.body.hasMedication,
      healthDetails: req.body.healthDetails,
      personalityDescription: req.body.personalityDescription,
      playDescription: req.body.playDescription,
      dietDescription: req.body.dietDescription,
      phone: req.body.phone,
    });

    await newAd.save();

    // Link the ad to the user's profile
    user.adoptionAds.push(newAd._id);
    await user.save();

    return res.status(201).json({
      success: true,
      message: "Adoption ad created successfully!",
      ad: newAd,
    });
  } catch (error) {
    console.error("Error submitting adoption ad:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const UpdateAdoptionAd = async (req, res) => {
  try {
    console.log("in updateAdoptionAd");

    // Get token from cookies
    const token = req.cookies.pet_ownerToken;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided, unauthorized" });
    }

    // Verify token and extract user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    // Find the user (ensure it's a pet owner)
    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Pet owner not found" });
    }

    // Get the ad ID from URL parameters and fetch the ad
    const adId = req.params.id;
    const ad = await AdoptionAdModel.findById(adId);
    if (!ad) {
      return res
        .status(404)
        .json({ success: false, message: "Adoption ad not found" });
    }

    // Check if the ad belongs to the user
    if (ad.user.toString() !== userId) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to update this ad" });
    }

    // Process new photos if provided; otherwise, keep existing photos
    let processedImages = ad.photos; 
    if (req.files && req.files.photos) {
      processedImages = await Promise.all(
        req.files.photos.map(async (file) => {
          const optimizedImageBuffer = await sharp(file.buffer)
            .resize({ width: 800, height: 800, fit: "inside" })
            .toFormat("jpeg", { quality: 80 })
            .toBuffer();
          return `data:image/jpeg;base64,${optimizedImageBuffer.toString("base64")}`;
        })
      );
    }

    // Convert breed field to a string if it's an array
    const breed =
      Array.isArray(req.body.breed) && req.body.breed.length > 0
        ? req.body.breed.join(", ")
        : req.body.breed;

    // Update ad fields with data from the request body
    ad.species = req.body.species;
    ad.reasonsForRehoming = req.body.reasonsForRehoming;
    ad.keepDuration = req.body.keepDuration;
    ad.city = req.body.city;
    ad.householdActivityLevel = req.body.householdActivityLevel;
    ad.otherPets = req.body.otherPets;
    ad.householdEnvironment = req.body.householdEnvironment;
    ad.name = req.body.name;
    ad.age = req.body.age;
    ad.breed = breed;
    ad.size = req.body.size;
    ad.gender = req.body.gender;
    ad.spayedNeutered = req.body.spayedNeutered;
    ad.microchipped = req.body.microchipped;
    ad.photos = processedImages;
    ad.ownedDuration = req.body.ownedDuration;
    ad.acquiredFrom = req.body.acquiredFrom;
    ad.colors = req.body.colors;
    ad.dogCharacteristics = req.body.dogCharacteristics;
    ad.catCharacteristics = req.body.catCharacteristics;
    ad.rabbitCharacteristics = req.body.rabbitCharacteristics;
    ad.dogSocialIssues = req.body.dogSocialIssues;
    ad.catSocialIssues = req.body.catSocialIssues;
    ad.upToDateVaccinations = req.body.upToDateVaccinations;
    ad.upToDateFleaWorm = req.body.upToDateFleaWorm;
    ad.upToDateDental = req.body.upToDateDental;
    ad.hasHealthIssues = req.body.hasHealthIssues;
    ad.hasMedication = req.body.hasMedication;
    ad.healthDetails = req.body.healthDetails;
    ad.personalityDescription = req.body.personalityDescription;
    ad.playDescription = req.body.playDescription;
    ad.dietDescription = req.body.dietDescription;
    ad.phone = req.body.phone;

    await ad.save();

    return res.status(200).json({
      success: true,
      message: "Adoption ad updated successfully!",
      ad,
    });
  } catch (error) {
    console.error("Error updating adoption ad:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const GetAllAdoptionAds = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 60;
    const skip = (page - 1) * limit;

    // Filtering logic
    let filter = { status: "Available" };
    if (req.query.species) filter.species = req.query.species;
    if (req.query.age) filter.age = req.query.age;
    if (req.query.breed) filter.breed = req.query.breed;
    if (req.query.size) filter.size = req.query.size;

    // Sorting logic: if sortBy is provided then use that, otherwise default to sorting by newest (createdAt descending)
    let sort = {};
    if (req.query.sortBy) {
      const order = req.query.order === "desc" ? -1 : 1;
      sort[req.query.sortBy] = order;
    } else {
      sort = { createdAt: -1 };
    }

    const ads = await AdoptionAdModel.find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sort);
    const totalAds = await AdoptionAdModel.countDocuments(filter); // Count total for pagination

    res.status(200).json({
      ads,
      totalPages: Math.ceil(totalAds / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching ads", error: error.message });
  }
};

export const GetUserAdoptionAds = async (req, res) => {
  try {
    console.log("Fetching user adoption ads");

    // Get token from cookies
    const token = req.cookies.pet_ownerToken;
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided, unauthorized" });
    }

    // Verify token and extract user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    // Find the user and populate their adoption ads
    const user = await UserModel.findById(userId).populate("adoptionAds");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      adoptionAds: user.adoptionAds,
    });
  } catch (error) {
    console.error("Error fetching adoption ads:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const GetAdoptionAdById = async (req, res) => {
  try {
    const petId = req.params.id;
    const ad = await AdoptionAdModel.findById(petId);
    if (!ad) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    res.json(ad); // or res.json({ ad }) if you prefer
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const SubmitAdoptionApplication = async (req, res) => {
  try {

    // Extract petId from URL parameters (e.g., /adoption-application/:petId)
    const petId = req.params.id;
    if (!petId) {
      return res.status(400).json({ success: false, message: "Pet ID is missing from URL." });
    }

    // Get token from cookies
    const token = req.cookies.pet_ownerToken;
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided, unauthorized" });
    }

    // Verify token and extract user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    // Find the user (ensure it's a pet owner)
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Process images if provided (using Multer, expecting field name "photos")
    let processedImages = [];
    if (req.files && req.files.homeImages) {
      processedImages = await Promise.all(
        req.files.homeImages.map(async (file) => {
          const optimizedImageBuffer = await sharp(file.buffer)
            .resize({ width: 800, height: 800, fit: 'inside' })
            .toFormat('jpeg', { quality: 80 })
            .toBuffer();
          return `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
        })
      );
    } 

    // Create the adoption application data.
    const newApplicationData = {
      userId: userId,
      petId: petId,
      adopter: {
        email: req.body.adopterEmail || req.body.email,
        fullName: req.body.adopterFullName || req.body.fullName,
        city: req.body.adopterCity || req.body.city,
        over18: req.body.over18,
      },
      homeDetails: {
        livingSituation: req.body.livingSituation,
        landlordPermission: req.body.landlordPermission,
        householdSetting: req.body.householdSetting,
        activityLevel: req.body.homeActivityLevel, // ensure client sends this field if needed
        homeImages: processedImages, // Array of Base64 image strings
      },
      familyDetails: {
        numberOfAdults: req.body.numberOfAdults,
        numberOfKids: req.body.numberOfKids,
        youngestChildAge: req.body.youngestChildAge,
        visitingChildren: req.body.visitingChildren === 'yes',
        flatmates: req.body.flatmates === 'yes',
        petAllergies: req.body.petAllergies === 'yes',
        otherAnimals: req.body.otherAnimals,
      },
      lifestyle: {
        description: req.body.lifestyle,
        movingSoon: req.body.movingSoon === 'yes',
        holidaysPlanned: req.body.holidaysPlanned === 'yes',
        ownTransport: req.body.ownTransport === 'yes',
      },
      experience: {
        description: req.body.experience,
      }
    };

    // Save the new adoption application.
    const newApplication = new AdoptionApplicationModel(newApplicationData);
    await newApplication.save();

    // Update the user's inquiries with the new application ID.
    user.inquiries.push(newApplication._id);
    await user.save();

    // Also update the corresponding AdoptionAd document by pushing the application ID into its inquiries array.
    const adoptionAd = await AdoptionAdModel.findById(petId);
    if (adoptionAd) {
      adoptionAd.inquiries.push(newApplication._id);
      await adoptionAd.save();
    } else {
      console.warn(`No AdoptionAd found with id ${petId}`);
    }

    return res.status(201).json({
      success: true,
      message: "Adoption application submitted successfully!",
      application: newApplication,
    });
  } catch (error) {
    console.error("Error submitting adoption application:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const GetAdoptionApplications = async (req, res) => {
  try {
    const petId = req.params.id;
    if (!petId) {
      return res.status(400).json({
        success: false,
        message: "Pet ID is required.",
      });
    }
    
    // Find all adoption applications for the specified petId
    const applications = await AdoptionApplicationModel.find({ petId });
    
    return res.status(200).json({
      success: true,
      applications, // Returns an array of applications
    });
  } catch (error) {
    console.error("Error fetching adoption applications:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const GetAdoptionApplicationDetails = async (req, res) => {
  try {
    // Extract application ID from URL parameters
    const { applicationId } = req.params; 
    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message: "Application ID is required.",
      });
    }

    // Find the application and optionally populate related fields
    const application = await AdoptionApplicationModel.findById(applicationId)
      .populate("userId", "name email")  // populates user details if needed
      .populate("petId", "title description"); // populates pet details if needed

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Adoption application not found.",
      });
    }

    // Return the application details as JSON
    return res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("Error fetching adoption application details:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const CheckUserApplication = async (req, res) => {
  try {
    const petId = req.params.id;
    const token = req.cookies.pet_ownerToken;
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided, unauthorized" });
    }

    // Verify token and extract user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    // Find the user (ensure it's a pet owner)
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Pet owner not found" });
    }

    // Query the AdoptionApplication collection for an application with both userId and petId.
    const application = await AdoptionApplicationModel.findOne({ userId, petId });

    if (application) {
      return res.status(200).json({ success: true, applied: true, application });
    }
    return res.status(200).json({ success: true, applied: false });
  } catch (error) {
    console.error("Error checking user application:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const GetMyApplications = async (req, res) => {
  try {
    // Get token from cookies
    const token = req.cookies.pet_ownerToken;
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided, unauthorized" });
    }
    
    // Verify token and extract user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }
    
    // Find all adoption applications for the user and populate the pet details
    const applications = await AdoptionApplicationModel.find({ userId })
      .populate("petId"); // This populates the AdoptionAd document referenced by petId

    return res.status(200).json({ success: true, applications });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const UpdateApplicationStatus = async (req, res) => {
  try {
    const { petId } = req.params;
    const { status } = req.body;

    if (!['Available', 'Pending', 'Adopted'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Use "Available", "Pending", or "Adopted"' });
    }

    // Attempt to update the pet ad directly
    let updatedPetAd = await AdoptionAdModel.findByIdAndUpdate(
      petId,
      { status },
      { new: true }
    );

    // If not found, try to find the adoption application and get the associated adoptionAd (via petId)
    if (!updatedPetAd) {
      const application = await AdoptionApplicationModel.findById(petId).populate('petId');
      if (!application || !application.petId) {
        return res.status(404).json({ message: 'Neither pet ad nor related application found' });
      }

      // Update the adoptionAd status from the application
      updatedPetAd = await AdoptionAdModel.findByIdAndUpdate(
        application.petId._id,
        { status },
        { new: true }
      );

      if (!updatedPetAd) {
        return res.status(404).json({ message: 'Associated pet ad could not be updated' });
      }
    }

    res.json({ message: `Pet ad status updated to ${status}`, petAd: updatedPetAd });
  } catch (error) {
    console.error('Error updating pet status:', error);
    res.status(500).json({ message: 'Server error updating pet status' });
  }
};

export const GetAdoptionAdStatusByApplicationId = async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Find the application and populate the related pet ad (petId)
    const application = await AdoptionApplicationModel.findById(applicationId).populate('petId');

    if (!application) {
      return res.status(404).json({ message: 'Adoption application not found' });
    }

    if (!application.petId) {
      return res.status(404).json({ message: 'Associated adoption ad not found' });
    }

    // The populated petId contains the full adoption ad document
    const status = application.petId.status;

    return res.json({ status });
  } catch (error) {
    console.error('Error fetching adoption ad status:', error);
    return res.status(500).json({ message: 'Server error while fetching status' });
  }
};
